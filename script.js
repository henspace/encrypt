const IV_LEN = 12;
const MIN_KEY_LEN = 8;
const ENCRYPTED_DATA_TAG = "!39867!"; // Don't include any regex control characters here.
var subtleCrypto;

/**
 * Dummy class just used for testing the UI in an non-secure context.
 */
class DummySubtleCrypto {
  /**
   *
   * @param {Object} algorithm
   * @param {*} key
   * @param {*} data
   */
  encrypt(algorithm, key, data) {
    alert("WARNING! Data not actually encrypted. Test only.");
    return Promise.resolve(data);
  }

  decrypt(algorithm, key, data) {
    return Promise.resolve(data);
  }
}

try {
  subtleCrypto = window.Crypto.subtle;
  if (!subtleCrypto) {
    throw new Error("Crypto subtle property not available.");
  }
} catch (err) {
  console.log(`Cannot use Web Api Crypto module. ${err}`);
  alert(
    "Crypto module not available. Dummy encryption undertaken for testing the UI only."
  );
  subtleCrypto = new DummySubtleCrypto();
  document.getElementById("output-area").classList.add("no-crypto");
}

/**
 * Perform the actual conversion
 */
function convert() {
  const inputText = document.getElementById("text-in").value;
  const key = document.getElementById("key").value;
  if (!isKeyValid(key)) {
    return;
  }
  const textToDecrypt = extractTextToDecrypt(inputText);
  if (textToDecrypt) {
    decryptText(textToDecrypt, key, document.getElementById("text-out"));
  } else {
    encryptText(inputText, key, document.getElementById("text-out"));
  }
}

/**
 * Check if key valid.
 * @param {string} key
 * @returns {boolean}
 */
function isKeyValid(key) {
  if (!key || key.length < MIN_KEY_LEN) {
    alert(`The key must be at least ${MIN_KEY_LEN} characters long!`);
    return false;
  }
  if (!key || key.trim().length != key.length) {
    alert(`The key cannot have leading or trailing spaces!`);
  }
  return true;
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
    ENCRYPTED_DATA_TAG + uint8ArrayToBase64(concatUint8Array(iv, cipherText));
}

/**
 * Decrypt text.
 * @param {string} inputText - text to decrypt
 * @param {string} key
 * @param {Element} elementOut - output element
 */
async function decryptText(inputText, ke, elementOut) {
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
 * @param {Uint8Array} arrB
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
