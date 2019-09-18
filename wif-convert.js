const crypto = require('crypto')
const bs58 = require('bs58')
const PRIVATE_KEY = '0C28FCA386C7A227600B2FE50B7CAE11EC86D3BF1FBE471BE89827E19D72AA1D'
const PRIVATE_KEY_EXTENDED = `80${PRIVATE_KEY}`

const PK_BUFFER = Buffer.from(PRIVATE_KEY_EXTENDED, 'hex')

const firstHash = crypto
  .createHash('sha256')
  .update(PK_BUFFER)
  .digest()

console.log('FIRST HASH: ', firstHash.toString('hex'))

const secondHash = crypto
  .createHash('sha256')
  .update(firstHash)
  .digest()

console.log('SECOND HASH: ', secondHash.toString('hex'))

const checksumBytes = secondHash.slice(0, 4)

console.log('CHECKSUM BYTES: ', checksumBytes.toString('hex'))

const WIF_RAW = Buffer.concat([PK_BUFFER, checksumBytes])

const WIF = bs58.encode(WIF_RAW)

console.log('WALLET IMPORT FORMAT: ', WIF)
