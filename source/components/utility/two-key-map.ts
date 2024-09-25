export class TwoKeyMap<K1,K2, V> {
	multiMap  = new Map<K1, Map<K2, V>>()
	set(key1:K1, key2:K2, value:V):void{
		if(!this.multiMap.has(key1)){
			this.multiMap.set(key1,new Map<K2,V>())
		}
		this.multiMap.get(key1)?.set(key2, value)
	}

    deleteKey1(key1: K1):boolean{
        return this.multiMap.delete(key1)
    }

    getKey1Map(key1: K1):Map<K2, V> | undefined{
        return this.multiMap.get(key1)
    }

	get(key1:K1, key2:K2):V | undefined{
		if(!this.multiMap.has(key1)){
			return undefined
		}
		return this.multiMap.get(key1)?.get(key2)
	}
    
    has(key1: K1, key2: K2):boolean{
        return this.multiMap.has(key1) ? (this.multiMap.get(key1)?.has(key2) ?? false) : false
    }
    delete(key1: K1, key2: K2):boolean{
        const map = this.multiMap.get(key1)
        if(map === undefined){
            return false
        }
        return map.delete(key2)
    }

    forEach(callbackfn:(value:V, key1:K1, key2:K2) => void):void{
        this.multiMap.forEach((key2Map,k1) => {
            key2Map.forEach((val, k2) => {
                callbackfn(val, k1, k2)
            })
        })
    }

    constructor(copyMap?: TwoKeyMap<K1,K2,V>){
        if(copyMap !== undefined){
            copyMap.multiMap.forEach((map, key1) => {
                this.multiMap.set(key1, new Map<K2,V>(map))
            })
        }
    }
}