# Encrypt-decrypt

Encrypt-decrypt is a simple online encryption and decryption tool.

The form is for test and proof of principle only. If you use the form to encrypt sensitive data, you do so at your own risk.

All code is provided in a single file to allow offline use in a secure context.

# Encryption

1. To encrypt data, select the _Encrypting_ checkbox.
1. Enter the text to encrypt in the _Text to encrypt_ field.
1. Type the password you want to use in the _Password_ field.
1. You have the option of using a key from a separate file for added security.
   1. If you want to use an existing key file, click the _Choose file_ button to select the key file.
   1. If you don't select a file, you will be given the option to create one later.
1. Click _Encrypt_.
1. The resulting encrypted text will appear in the _Encrypted text_ field.
1. Note that if anyone needs to decrypt the data later, they will need the password and, if used, the additional key file.

# Decryption

1. To decrypt data, ensure the _Encrypting_ checkbox is unchecked.
1. Enter the text to decrypt in the _Text to decrypt_ field.
1. Type the associated password in the _Password_ field.
1. If the text was encrypted using an additional key file, click the _Choose file_ button to select the appropriate key file.
1. Click _Decrypt_.
1. The resulting decrypted text will appear in the _Decrypted text_ field.

# Privacy

The application runs entirely client-side. Although it is available online, you can save the file locally and run without any internet connection at all. The file is entirely self-contained with no external dependencies.

- No data is sent to any server.
- No cookies or data are saved on your device.
- No personal information is collected.
- No adverts are served.
