let db;
const DB_NAME = 'CydogExtensionDB';
const DB_VERSION = 1;
const STORE_NAME_PASSWORDS = 'DeterrencePasswords';
openDatabase();
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME_PASSWORDS)) {
        db.createObjectStore(STORE_NAME_PASSWORDS, { keyPath: 'site' });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.warn('Cydog opened extension IndexedDB successfully.');
      resolve(db);
    };

    request.onerror = (event) => {
      console.error('Cydog could not open extension IndexedDB:', event.target.errorCode);
      reject(event.target.error);
    };
  });
}
async function savePassword(url, password){
    await addPassword(url, password);
}
async function getPassword(url){
    const passwordActual = await getPassword(url);
    return passwordActual;
}
async function removePassword(url){
    await removePassword(url);
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'savePassword') {
    const { url, password } = request.data;
    try{
        savePassword(url, password);
        sendResponse({ status: "success" });
    } catch (e){
        console.error('Cydog was unable to save this password.');
    }
  } else if (request.action === 'getPassword') {
    const { url } = request.data;
    try{
        const result = getPassword(url).then((passwordActual) => {
            sendResponse({ password: `${passwordActual}` });
        }).catch((error) => {
            console.error("Cydog was unable to get this password:", error);
        });
    } catch (e){
        console.error('Cydog was unable to get this password.');
    }
    return true;
  } else if (request.action === 'removePassword') {
    const { url } = request.data;
    try{
        removePassword(url);
        sendResponse({ status: "success" });
    } catch (e){
        console.error('Cydog was unable to autodelete this password.');
    }
  }
});

// Function to add a password entry
async function addPassword(site, password) {
  try{
    const textEncoder = new TextEncoder();
    const encodedPlaintext = textEncoder.encode(password);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await crypto.subtle.generateKey(
        {
        name: "AES-GCM",
        length: 256,
        },
        true, // extractable
        ["encrypt", "decrypt"]
    );
    const ciphertext = await crypto.subtle.encrypt(
        {
        name: "AES-GCM",
        iv: iv,
        },
        key,
        encodedPlaintext
    );
    const encryptedPassword = {ciphertext: Array.from(new Uint8Array(ciphertext)), iv: Array.from(iv), key: key};
    const entry = {
        site: site,
        password: encryptedPassword,
        timestamp: new Date().getTime()
    };
    const retrievedPassword = await getPassword(site);
    if(retrievedPassword === null) {
        const database = await openDatabase();
        const transaction = database.transaction([STORE_NAME_PASSWORDS], 'readwrite');
        const store = transaction.objectStore(STORE_NAME_PASSWORDS);
        const request = store.put(entry);
        request.onsuccess = async () => {
            console.warn(`Cydog saved password for ${site}.`);
        };
        request.onerror = async (event) => {
            console.error('Cydog could not save password:', event.target.error);
        };
    } else {
        console.error('Cydog could not save password.');
    }
  } catch(e){
    console.error('Cydog could not save password:', e);
  }
}

// Function to get a password entry
async function getPassword(site) {
  const database = await openDatabase();
  const transaction = database.transaction([STORE_NAME_PASSWORDS], 'readonly');
  const store = transaction.objectStore(STORE_NAME_PASSWORDS);
  const request = store.get(site);
  return new Promise((resolve, reject) => {
    request.onsuccess = async (event) => {
      const entry = event.target.result;
      console.log(entry);
      if (entry) {
        const textDecoder = new TextDecoder();
        const iv = new Uint8Array(entry.password.iv);
        const ciphertext = new Uint8Array(entry.password.ciphertext);
        const key = entry.password.key;
        const decrypted = await crypto.subtle.decrypt(
            {
            name: "AES-GCM",
            iv: iv,
            },
            key,
            ciphertext
        );
        resolve(textDecoder.decode(decrypted));
      } else {
        resolve(null);
      }
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Function to delete a password entry
async function removePassword(site){
    const database = await openDatabase();
    const transaction = database.transaction([STORE_NAME_PASSWORDS], 'readwrite');
    const store = transaction.objectStore(STORE_NAME_PASSWORDS);
    const request = store.delete(site);
    request.onsuccess = () => {
        console.log("Cydog autodeleted failed entry.");
    };
    request.onerror = (event) => {
        console.error("Cydog failed to autodelete entry:", event.target.errorCode);
    };
}