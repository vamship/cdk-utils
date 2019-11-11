import { argValidator as _argValidator } from '@vamship/arg-utils';
import { KMS } from 'aws-sdk';
import { Promise } from 'bluebird';

/**
 * Utility class that can be used to encrypt secret values using a kms key.
 */
export default class SecretManager {
    private _keyId: string;

    /**
     * @param keyId The id of the key to use when generating encrypted values.
     */
    constructor(keyId: string) {
        _argValidator.checkString(keyId, 1, 'Invalid key id (arg #1)');
        this._keyId = keyId;
    }

    /**
     * Asynchronous helper method that uses the kms alias to create a secret
     * manager instance.
     *
     * @param The alias of the kms key to use for encryption.
     *
     * @returns A secret manager instance.
     */
    public static async create(alias: string): Promise<SecretManager> {
        const kms = new KMS();

        const listAliases = Promise.promisify(kms.listAliases.bind(kms));

        const result = await listAliases({});
        const keyId = result.Aliases.find(
            ({ AliasName: aliasName }) => aliasName === alias
        );

        if (!keyId) {
            throw new Error(`Could not find KMS key for alias: [${alias}]`);
        }

        return new SecretManager(keyId);
    }

    /**
     * Encrypts a string and returns the encrypted value.
     *
     * @param plaintext The plaintext string to encrypt.
     *
     * @returns An encrypted string using the key associated with this class.
     */
    public async encrypt(plaintext: string): Promise<string> {
        const kms = new KMS();

        const encrypt = Promise.promisify(kms.encrypt.bind(kms));

        const result = await encrypt({
            KeyId: this._keyId,
            PlainText: plaintext
        });

        if(!result || !result.CipherTextBlob) {
            throw new Error('Error encrypting string using KMS');
        }
        return result.CipherTextBlob;
    }
}
