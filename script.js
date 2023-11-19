const IV_LEN = 12;
const MIN_KEY_LEN = 8;
const ENCRYPTED_DATA_TAG = "!39867!"; // Don't include any regex control characters here.
const SALT = "encryptDecryptData";
var subtleCrypto;

try {
  subtleCrypto = window.crypto.subtle;
  if (!subtleCrypto) {
    throw new Error("Crypto subtle property not available.");
  }
} catch (err) {
  console.log(`Cannot use Web Api Crypto module. ${err}`);
  document.body.innerHTML =
    '<div class="error"><p>Sorry but the cryptographic routines are not available on this device.</p></div>';
}

/**
 * Perform the actual conversion
 */
async function convert() {
  const inputText = document.getElementById("text-in").value;
  const password = document.getElementById("password").value;
  if (!isPasswordValid(password)) {
    return;
  }
  const key = await generateKey(password);
  const textToDecrypt = extractTextToDecrypt(inputText);
  if (textToDecrypt) {
    decryptText(textToDecrypt, key, document.getElementById("text-out"));
  } else {
    encryptText(inputText, key, document.getElementById("text-out"));
  }
}

/**
 * Check if key valid.
 * @param {string} password
 * @returns {boolean}
 */
function isPasswordValid(password) {
  if (!password || password.length < MIN_KEY_LEN) {
    alert(`The key must be at least ${MIN_KEY_LEN} characters long!`);
    return false;
  }
  if (!password || password.trim().length != password.length) {
    alert(`The key cannot have leading or trailing spaces!`);
  }
  return true;
}

/**
 * Generate crypto key from password
 * @param {string} password
 * @returns  {CryptoKey}
 */
function generateKey(password) {
  return subtleCrypto
    .importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
      "deriveBits",
      "deriveKey",
    ])
    .then((keyMaterial) =>
      subtleCrypto.deriveKey(
        {
          name: "PBKDF2",
          hash: "SHA-256",
          salt: new TextEncoder().encode(SALT),
          iterations: 1000,
        },
        keyMaterial,
        {
          name: "AES-GCM",
          length: 256,
        },
        false,
        ["encrypt", "decrypt"]
      )
    );
}

/**
 * Look to see if input should be decoded. Leading and trailing whitespace
 * is ignored. The remaining text must be valid base64.
 * @param {string} inputText
 * @returns {string} null if not to be decoded.
 */
function extractTextToDecrypt(inputText) {
  const regex = new RegExp(ENCRYPTED_DATA_TAG + "s*([A-Za-z0-9+/]+={0,2})s*");
  const matches = inputText.match(regex);
  return matches ? matches[1] : null;
}

/**
 * Encrypt text.
 * @param {string} inputText - text to encrypt
 * @param {string} key - encryption key
 * @param {Element} elementOut - output element
 */
async function encryptText(inputText, key, elementOut) {
  const encoded = new TextEncoder().encode(inputText);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const cipherText = await subtleCrypto.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoded
  );
  elementOut.value =
    ENCRYPTED_DATA_TAG +
    uint8ArrayToBase64(concatUint8Array(iv, new Uint8Array(cipherText)));
}

/**
 * Decrypt text.
 * @param {string} inputText - text to decrypt
 * @param {string} key
 * @param {Element} elementOut - output element
 */
async function decryptText(inputText, key, elementOut) {
  const bytes = base64ToBytes(inputText);
  const ivBytes = bytes.slice(0, IV_LEN);
  const cipherText = bytes.slice(IV_LEN);

  const decrypted = await subtleCrypto.decrypt(
    {
      name: "AES-GCM",
      iv: ivBytes,
    },
    key,
    cipherText
  );

  const decoded = new TextDecoder().decode(decrypted);
  elementOut.value = decoded;
}

/**
 * Convert base64 to array.
 * @param {string} base64
 * @returns {Uint8Array}
 */
function base64ToBytes(base64) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

/**
 * Convert array to base64 string
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function uint8ArrayToBase64(bytes) {
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}

/**
 *
 * @param {Uint8Array} arrA
 * @param {Uint8Buffer} arrB
 * @returns {Uint8Array}
 */
function concatUint8Array(arrA, arrB) {
  const newArray = new Uint8Array(arrA.length + arrB.length);
  newArray.set(arrA, 0);
  newArray.set(arrB, arrA.length);
  return newArray;
}

/*Test pattern.
😀Here are a lot of people 👨‍👩‍👧 😀.
With multiple lines.

"Mary had a little lamb.
It's fleece was white as snow.
And everywhere that Mary went,
That lamb was sure to go."
*/
