
//create namespace for our color math functions
var colorMath = {};



// RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB
// RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB +++ RGB

//convert R, G, B to a HEX value
colorMath.RGBToHex = function(R, G, B){
	//use "magic" to get the hex string from the RGB values
	return ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
}//rgbToHex(R, G, B)



// FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT
// FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT +++ FLOAT

//convert a float to a grayscale RGB
colorMath.floatToRGB = function(value){

	//first, limit the float value to 0 < value < 1
	if(value < 0) value = 0;
	if(value > 1) value = 1;

	//next convert the value to an integer between 0 and 255
	value = parseInt(value * 255);

	//return the R, G, B values
	return 	{
				r: value,
				g: value,
				b: value
			}

}//floatToRgb(float)

//convert a float to a grayscale HEX
colorMath.floatToHex = function(value){

	//first convert it to RGB
	var RGB = colorMath.floatToRGB(value);

	//convert and return the HEX
	return colorMath.RGBToHex( RGB.r, RGB.g, RGB.b);
}//floatToHex(value)



// INTEGER +++ INTEGER +++ INTEGER +++ INTEGER +++ INTEGER +++ INTEGER +++ INTEGER +++ INTEGER +++ INTEGER +++ INTEGER +++ INTEGER +++ INTEGER
// INTEGER +++ INTEGER +++ INTEGER +++ INTEGER +++ INTEGER +++ INTEGER +++ INTEGER +++ INTEGER +++ INTEGER +++ INTEGER +++ INTEGER +++ INTEGER

//convert an integer to grayscale RGB
colorMath.intToRGB = function(value){

	//make sure it's a proper int
	value = parseInt(value);

	//make sure it's in range from 0 to 255
	if(value < 0) value = 0;
	if(value > 255) value = 255;

	//return the R, G, B values
	return 	{
				r: value,
				g: value,
				b: value
			}
}//intToRGB(value)

//conver an integer to grayscale hex
colorMath.intToHex = function(value){

	//first convert it to RGB
	var RGB = colorMath.intToRGB(value);

	//convert and return the HEX
	return colorMath.RGBToHex( RGB.r, RGB.g, RGB.b);

}//fintToHex(value)



// HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX
// HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX +++ HEX

//convert a hex code to R, G, B values
colorMath.hexToRGB = function(hex) {

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;

}//hexToRgb(hex)

//convert a hex code to an int value
colorMath.hexToInt = function(hex){

	//get RGB components from the hex value
	var RGB = colorMath.hexToRGB(hex);

	//avereage the R, G, B values
	var RGBAverage = (RGB.r + RGB.g + RGB.b)/3;

	//convert to int and return
	return parseInt(RGBAverage);
	
}//hextToInt(hex)

//convert a hex code to a float value
colorMath.hexToFloat = function(hex){

	//get the int average from the hex
	var RGBAverage = colorMath.hexToInt(hex);

	//convert the int average to a float between 0 and 1
	return RGBAverage / 255;
}//hexToFloat(hex)

