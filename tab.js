function lighten(h,p){
  const[r,g,b]=hexToRgb(h);
  const mix=(c)=>Math.round(c+(255-c)*p/100);
  return`#${mix(r).toString(16).padStart(2,"0")}${mix(g).toString(16).padStart(2,"0")}${mix(b).toString(16).padStart(2,"0")}`;
}
function darken(h,p){
  const[r,g,b]=hexToRgb(h);
  const mix=(c)=>Math.round(c*(1-p/100));
  return`#${mix(r).toString(16).padStart(2,"0")}${mix(g).toString(16).padStart(2,"0")}${mix(b).toString(16).padStart(2,"0")}`;
}
