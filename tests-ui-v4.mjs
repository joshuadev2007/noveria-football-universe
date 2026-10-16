import assert from 'node:assert/strict';
const handlers={};const nodes=new Map();function node(id){if(!nodes.has(id))nodes.set(id,{id,innerHTML:'',style:{},appendChild(){},setAttribute(){},classList:{toggle(){}},remove(){}});return nodes.get(id)}
globalThis.localStorage={data:new Map(),setItem(k,v){this.data.set(k,v)},getItem(k){return this.data.get(k)||null},removeItem(k){this.data.delete(k)}};
globalThis.document={getElementById:node,querySelectorAll:()=>[],addEventListener(type,fn){handlers[type]=fn},body:{style:{}},createElement:()=>({textContent:'',className:'',style:{},remove(){},click(){},appendChild(){},setAttribute(){}})};
globalThis.window={location:{hash:''},scrollTo(){},addEventListener(){}};
globalThis.location={protocol:'file:'};
await import('./app.js');await new Promise(ok=>setTimeout(ok,180));assert(node('app').innerHTML.includes('Centro de mando'),'No apareció inicio');
function click(action,dataset={}){handlers.click({target:{closest:()=>({dataset:{action,...dataset},classList:{contains:()=>false}})}})}
for(const target of ['mundo','pais','arc','vivo','prensa','aficion','cantera','estadios','premios','museo','carrera','torneos']){click('nav',{target});assert(node('app').innerHTML.length>100,`Pantalla vacía ${target}`);console.log('PANTALLA V4',target,node('app').innerHTML.length);}
click('select-country',{country:'Varkosia'});assert(node('app').innerHTML.includes('Federación de Varkosia'));assert(node('app').innerHTML.includes('SEGUNDA DIVISIÓN'));
click('sim-country',{country:'Varkosia'});assert(node('app').innerHTML.includes('Resultados'));click('nav',{target:'carrera'});click('career-offers');assert(node('app').innerHTML.includes('ofertas'));
click('nav',{target:'prensa'});click('press-answer',{answer:'calm'});assert(node('app').innerHTML.includes('Periodista'));
click('nav',{target:'cantera'});assert(node('app').innerHTML.includes('Academia de'));
click('nav',{target:'inicio'});click('simulate-league');assert(node('app').innerHTML.includes('Resultados'));
console.log('INTERFAZ V4 OK: páginas, país, simulaciones, modo DT, prensa, cantera, resultados');
