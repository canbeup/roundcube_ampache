var locStore = {
	internalVar: [],
	get: function(name){
		if(typeof localStorage!=='undefined') return localStorage.getItem(name);
		else if(locStore.internalVar[name]!==undefined) return locStore.internalVar[name];
		else return null;
	},
	set: function(name, value){
		if(typeof localStorage!=='undefined') return localStorage.setItem(name, value);
		else locStore.internalVar[name] = value;
	}
};