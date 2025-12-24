import * as ldap from "ldapjs";

/**
 * Authentifie un utilisateur admin contre le serveur LDAP
 * @param uid - L'identifiant utilisateur (ex: admin1)
 * @param password - Le mot de passe
 * @returns Promesse résolue avec {uid, authenticated: true}
 */
export async function authenticateWithLDAP(
  uid: string,
  password: string
): Promise<{ uid: string; authenticated: boolean }> {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({
      url: process.env.LDAP_URL || "ldap://localhost:389",
      timeout: 5000,
      connectTimeout: 5000,
    });

    // Construire le DN : uid=admin1,dc=rsx103,dc=fr
    const baseDn = process.env.LDAP_BASE_DN || "dc=rsx103,dc=fr";
    const userDn = `uid=${uid},${baseDn}`;

    client.bind(userDn, password, (err) => {
      client.unbind();

      if (err) {
        console.error(`[LDAP] Authentication failed for ${uid}:`, err.message);
        reject(new Error("Invalid LDAP credentials"));
        return;
      }

      console.log(`[LDAP] Authentication successful for ${uid}`);
      resolve({ uid, authenticated: true });
    });

    client.on("error", (err) => {
      console.error("[LDAP] Client error:", err.message);
      reject(err);
    });
  });
}

/**
 * Vérifie si un utilisateur existe dans LDAP
 */
export async function checkLDAPUser(uid: string): Promise<boolean> {
  return new Promise((resolve) => {
    const client = ldap.createClient({
      url: process.env.LDAP_URL || "ldap://localhost:389",
      timeout: 5000,
      connectTimeout: 5000,
    });

    const baseDn = process.env.LDAP_BASE_DN || "dc=rsx103,dc=fr";
    const userDn = `uid=${uid},${baseDn}`;

    client.search(userDn, { scope: "base" }, (err, res) => {
      if (err) {
        client.unbind();
        resolve(false);
        return;
      }

      let found = false;
      res.on("searchEntry", () => {
        found = true;
      });

      res.on("end", () => {
        client.unbind();
        resolve(found);
      });

      res.on("error", () => {
        client.unbind();
        resolve(false);
      });
    });
  });
}
