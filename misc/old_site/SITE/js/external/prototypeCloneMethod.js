/* Object.prototype.cloneObj = Array.prototype.cloneObj = function(){
    if (Object.prototype.toString.call(this) === '[object Array]')
    {
        var cloneObj = [];
        for (var i=0; i<this.length; i++)
            cloneObj[i] = this[i].cloneObj();

        return cloneObj;
    } 
    else if (typeof(this)=="object")
    {
        var cloneObj = {};
        for (var prop in this)
            if (this.hasOwnProperty(prop))
                cloneObj[prop] = this[prop].cloneObj();

        return cloneObj;
    }
    else
        return this;
}*/

function goclone(source) {
    if (Object.prototype.toString.call(source) === '[object Array]') {
        var clone = [];
        for (var i=0; i<source.length; i++) {
            clone[i] = goclone(source[i]);
        }
        return clone;
    } else if (typeof(source)=="object") {
        var clone = {};
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                clone[prop] = goclone(source[prop]);
            }
        }
        return clone;
    } else {
        return source;
    }
}