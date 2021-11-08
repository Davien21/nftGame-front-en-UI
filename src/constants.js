const CONTRACT_ADDRESS = "0x9E3FEacB674fd45dbf97652d343cfC08579cbC52"

const transformCharacter = (data) => {
    return {
        name: data.name,
        imageURI: data.imageURI,
        hp: data.hp.toNumber(),
        maxHp: data.hp.toNumber(),
        attackDamage: data.attackDamage.toNumber()
    }

}

export { CONTRACT_ADDRESS, transformCharacter };