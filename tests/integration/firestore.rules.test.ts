import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

/**
 * Prueba cada rama de `firestore.rules` con el emulador real: es la única forma de verificar
 * las reglas, porque el Admin SDK (el resto de la app) las salta por completo. Cubre las
 * asimetrías intencionales documentadas en el propio archivo de reglas (p.ej. un gestor puede
 * `get` la jornada ajena pero no `list`arlas desde el cliente) para que un cambio futuro que
 * las rompa por accidente falle aquí antes que en producción.
 */

const ADMIN = "admin-uid";
const COORDINADOR = "coordinador-uid";
const INGENIERO = "ingeniero-uid";
const PENDIENTE = "pendiente-uid";
const OTRO = "otro-ingeniero-uid";
const MODELADOR = "modelador-uid";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-mep-manager",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await Promise.all([
      setDoc(doc(db, "usuarios", ADMIN), { uid: ADMIN, rol: "admin", activo: true, nombre: "Admin" }),
      setDoc(doc(db, "usuarios", COORDINADOR), {
        uid: COORDINADOR,
        rol: "coordinador",
        activo: true,
        nombre: "Coordinador",
      }),
      setDoc(doc(db, "usuarios", INGENIERO), { uid: INGENIERO, rol: "ingeniero", activo: true, nombre: "Ingeniero" }),
      setDoc(doc(db, "usuarios", OTRO), { uid: OTRO, rol: "ingeniero", activo: true, nombre: "Otro" }),
      setDoc(doc(db, "usuarios", MODELADOR), { uid: MODELADOR, rol: "modelador", activo: true, nombre: "Modelador" }),
      setDoc(doc(db, "usuarios", PENDIENTE), { uid: PENDIENTE, rol: "usuario", activo: false, nombre: "Pendiente" }),
      setDoc(doc(db, "proyectos", "p1"), { nombre: "Proyecto 1" }),
      setDoc(doc(db, "proyectos", "p1", "tareas", "t1"), { nombre: "Tarea 1" }),
      setDoc(doc(db, "jornadas", "j-ingeniero"), { uid: INGENIERO, fecha: "2026-08-14" }),
      setDoc(doc(db, "jornadas", "j-otro"), { uid: OTRO, fecha: "2026-08-14" }),
      setDoc(doc(db, "config", "equipo"), { membersLegacy: [] }),
      setDoc(doc(db, "catalogoOverrides", "PB-01-01"), { oculto: true }),
      setDoc(doc(db, "horarios", INGENIERO), { uid: INGENIERO, dias: {} }),
    ]);
  });
});

function como(uid: string) {
  return testEnv.authenticatedContext(uid).firestore();
}
function anonimo() {
  return testEnv.unauthenticatedContext().firestore();
}

describe("usuarios", () => {
  it("un usuario pendiente puede leer su propio doc (si no, el login lo reporta como credenciales inválidas)", async () => {
    await assertSucceeds(getDoc(doc(como(PENDIENTE), "usuarios", PENDIENTE)));
  });

  it("nadie sin sesión puede leer un doc de usuario", async () => {
    await assertFails(getDoc(doc(anonimo(), "usuarios", INGENIERO)));
  });

  it("un usuario activo no puede leer el doc de otro sin ser gestor", async () => {
    await assertFails(getDoc(doc(como(MODELADOR), "usuarios", OTRO)));
  });

  it("un gestor (coordinador o ingeniero) sí puede leer el doc de otro usuario", async () => {
    await assertSucceeds(getDoc(doc(como(COORDINADOR), "usuarios", INGENIERO)));
    await assertSucceeds(getDoc(doc(como(INGENIERO), "usuarios", OTRO)));
  });

  it("solo un admin puede listar /usuarios", async () => {
    await assertFails(getDocs(collection(como(COORDINADOR), "usuarios")));
    await assertSucceeds(getDocs(collection(como(ADMIN), "usuarios")));
  });

  it("el alta propia con la forma correcta (rol usuario, activo false) se permite", async () => {
    await assertSucceeds(
      setDoc(doc(como("nuevo-uid"), "usuarios", "nuevo-uid"), {
        uid: "nuevo-uid",
        rol: "usuario",
        activo: false,
        nombre: "Nuevo",
      }),
    );
  });

  it("nadie se autoasciende de rol al darse de alta", async () => {
    await assertFails(
      setDoc(doc(como("nuevo-uid"), "usuarios", "nuevo-uid"), {
        uid: "nuevo-uid",
        rol: "admin",
        activo: false,
        nombre: "Nuevo",
      }),
    );
  });

  it("nadie se autoactiva al darse de alta", async () => {
    await assertFails(
      setDoc(doc(como("nuevo-uid"), "usuarios", "nuevo-uid"), {
        uid: "nuevo-uid",
        rol: "usuario",
        activo: true,
        nombre: "Nuevo",
      }),
    );
  });

  it("no se puede crear el doc de alta de OTRO uid", async () => {
    await assertFails(
      setDoc(doc(como(INGENIERO), "usuarios", "otro-nuevo-uid"), {
        uid: "otro-nuevo-uid",
        rol: "usuario",
        activo: false,
        nombre: "X",
      }),
    );
  });

  it("un usuario activo puede editar su propio doc manteniendo uid/rol/activo congelados", async () => {
    await assertSucceeds(updateDoc(doc(como(INGENIERO), "usuarios", INGENIERO), { nombre: "Ingeniero renombrado" }));
  });

  it("un usuario activo NO puede cambiarse el rol a sí mismo", async () => {
    await assertFails(updateDoc(doc(como(INGENIERO), "usuarios", INGENIERO), { rol: "admin" }));
  });

  it("un usuario activo NO puede activarse a sí mismo", async () => {
    await assertFails(updateDoc(doc(como(PENDIENTE), "usuarios", PENDIENTE), { activo: true }));
  });

  it("un admin sí puede aprobar (cambiar activo) el doc de otro usuario", async () => {
    await assertSucceeds(updateDoc(doc(como(ADMIN), "usuarios", PENDIENTE), { activo: true }));
  });

  it("solo un admin puede borrar un doc de usuario", async () => {
    await assertFails(deleteDoc(doc(como(COORDINADOR), "usuarios", INGENIERO)));
    await assertSucceeds(deleteDoc(doc(como(ADMIN), "usuarios", INGENIERO)));
  });
});

describe("proyectos y tareas", () => {
  it("un usuario activo puede leer un proyecto y sus tareas", async () => {
    await assertSucceeds(getDoc(doc(como(INGENIERO), "proyectos", "p1")));
    await assertSucceeds(getDoc(doc(como(INGENIERO), "proyectos", "p1", "tareas", "t1")));
  });

  it("un usuario pendiente (activo=false) no puede leer proyectos", async () => {
    await assertFails(getDoc(doc(como(PENDIENTE), "proyectos", "p1")));
  });

  it("el cliente nunca puede escribir un proyecto ni una tarea, ni siquiera un admin", async () => {
    await assertFails(setDoc(doc(como(ADMIN), "proyectos", "p1"), { nombre: "hackeado" }));
    await assertFails(setDoc(doc(como(ADMIN), "proyectos", "p1", "tareas", "t1"), { nombre: "hackeado" }));
  });
});

describe("jornadas", () => {
  it("el dueño puede leer (get) su propia jornada", async () => {
    await assertSucceeds(getDoc(doc(como(INGENIERO), "jornadas", "j-ingeniero")));
  });

  it("otro usuario sin ser gestor no puede leer (get) una jornada ajena", async () => {
    await assertFails(getDoc(doc(como(MODELADOR), "jornadas", "j-otro")));
  });

  it("un gestor (coordinador o ingeniero) SÍ puede leer (get) una jornada ajena", async () => {
    await assertSucceeds(getDoc(doc(como(COORDINADOR), "jornadas", "j-otro")));
    await assertSucceeds(getDoc(doc(como(INGENIERO), "jornadas", "j-otro")));
  });

  it("un usuario puede listar (query) sus propias jornadas", async () => {
    const q = query(collection(como(INGENIERO), "jornadas"), where("uid", "==", INGENIERO));
    await assertSucceeds(getDocs(q));
  });

  it("un gestor NO puede listar (query) las jornadas de otro desde el cliente, aunque sí pueda hacer get() individual", async () => {
    // Asimetría intencional documentada en firestore.rules: `list` no puede probarse con un OR
    // + get() ajeno, así que los reportes de equipo se sirven con el Admin SDK, no con una query.
    const q = query(collection(como(COORDINADOR), "jornadas"), where("uid", "==", INGENIERO));
    await assertFails(getDocs(q));
  });

  it("el cliente nunca puede escribir una jornada", async () => {
    await assertFails(setDoc(doc(como(INGENIERO), "jornadas", "j-nueva"), { uid: INGENIERO, fecha: "2026-08-14" }));
  });
});

describe("config", () => {
  it("un usuario activo puede leer /config, pero no escribirlo", async () => {
    await assertSucceeds(getDoc(doc(como(INGENIERO), "config", "equipo")));
    await assertFails(setDoc(doc(como(ADMIN), "config", "equipo"), { membersLegacy: ["x"] }));
  });
});

describe("catalogoOverrides", () => {
  it("solo un admin puede leer catalogoOverrides; nadie puede escribirlo desde el cliente", async () => {
    await assertFails(getDoc(doc(como(COORDINADOR), "catalogoOverrides", "PB-01-01")));
    await assertSucceeds(getDoc(doc(como(ADMIN), "catalogoOverrides", "PB-01-01")));
    await assertFails(setDoc(doc(como(ADMIN), "catalogoOverrides", "PB-01-01"), { oculto: false }));
  });
});

describe("horarios", () => {
  it("el dueño y un gestor (coordinador o ingeniero) pueden leer un horario; un tercero no; nadie escribe desde el cliente", async () => {
    await assertSucceeds(getDoc(doc(como(INGENIERO), "horarios", INGENIERO)));
    await assertSucceeds(getDoc(doc(como(COORDINADOR), "horarios", INGENIERO)));
    await assertSucceeds(getDoc(doc(como(OTRO), "horarios", INGENIERO)));
    await assertFails(getDoc(doc(como(MODELADOR), "horarios", INGENIERO)));
    await assertFails(setDoc(doc(como(INGENIERO), "horarios", INGENIERO), { uid: INGENIERO, dias: {} }));
  });
});

it("el proyecto de prueba usa Firestore real vía emulador, no un mock", () => {
  expect(testEnv).toBeDefined();
});
