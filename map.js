var x = map_range(155,0,255,-100,100);
console.log(x);


function map_range(value, low1, high1, low2, high2) {
    return Math.floor(low2 + (high2 - low2) * (value - low1) / (high1 - low1));
}