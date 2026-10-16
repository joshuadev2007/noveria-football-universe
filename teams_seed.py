import json
from pathlib import Path
p=Path(__file__).parent
# name, city, founded, first color, second color, stadium, capacity, nickname, supporter, identity, OVR
A=[
('Atlético Aurena','Aurena',1908,'#761c37','#d4aa45','Palacio de Acero',51200,'Los Reyes','La Guardia Granate','Posesión y talento',75),
('Deportivo Puerto Bruma','Puerto Bruma',1923,'#16aaa7','#f4f4f4','Faro de la Victoria',39100,'Los Navegantes','La Bruma Eterna','Extremos veloces',72),
('Real Monteluz','Monteluz',1911,'#542b87','#c9ced4','Cumbre Imperial',33500,'Los Montañeses','La Corte Alta','Precisión en altura',74),
('Estrella de Miravia','Miravia',1905,'#7f3fb7','#ffffff','El Firmamento',44000,'Las Estrellas','La Constelación','Cantera de artistas',75),
('Ferroviarios de Ferral','Ferral',1926,'#17663d','#151515','Estación Central',30200,'La Locomotora','Los del Riel','Presión y orden',70),
('Titanes de Tarsena','Tarsena',1929,'#a97542','#151515','Fortaleza del Sur',40100,'Los Titanes','La Muralla','Juego físico',71),
('Atlético Solverde','Solverde',1952,'#43aa35','#f3d83d','Jardín del Trueno',25900,'Los Selváticos','La Selva Viva','Ataque vertical',68),
('Independiente San Orio','San Orio',1944,'#182c57','#ee8227','Bastión de San Orio',28800,'Los Libres','Los Inconformes','Contraataque y carácter',70),
('Halcones de Venturia','Venturia',1971,'#f5f5f5','#77c4ea','Nido del Viento',27300,'Los Halcones','El Vuelo','Transiciones rápidas',69)]
B=[
('Unión Popular Aurena','Aurena',1917,'#ce202b','#151515','La Forja',45800,'Los Obreros','El Pueblo de Hierro','Presión intensa y garra',72),
('Sporting Bahía Clara','Bahía Clara',1931,'#1551b5','#ffffff','Arena del Mar',37600,'Los Marineros','La Ola Azul','Ataque por las bandas',72),
('Deportivo Rocafría','Rocafría',1940,'#75c9e8','#141414','Nido de Hielo',22400,'Los Gélidos','La Escarcha','Bloque defensivo',69),
('Imperial Seravia','Seravia',1902,'#168a5a','#ffffff','Coliseo de los Fundadores',49500,'Los Imperiales','La Legión Verde','Dominio del medio',76),
('Atlético Laguna Roja','Laguna Roja',1957,'#ca233a','#ffffff','La Salina',28000,'Los Rojos del Sur','La Mancha Roja','Drible y amplitud',68),
('Deportivo Vallealto','Vallealto',1948,'#e9c52b','#266a3e','Los Viñedos',23400,'Los Campesinos','La Semilla','Centro y remate',67),
('Mineros de Carbalia','Carbalia',1934,'#ef7c21','#161616','El Socavón',24700,'Los Mineros','Los del Casco','Defensa y pelota parada',67),
('Academia Liria','Liria',1964,'#b38ed9','#d6ae38','Aula Magna',19600,'Los Académicos','La Tribuna Estudiantil','Juventud creativa',68),
('Náutico Caldera','Isla Caldera',1937,'#122849','#ff8577','Volcán del Mar',21800,'Los Volcánicos','La Marea de Fuego','Juego tropical y técnico',69)]
S=[
('Juventud Miravia','Miravia',1989,'#6a2b88','#111111','Parque Cometa',12000,'Los Jóvenes','Los Jóvenes del Cielo','Cantera',63),
('Deportivo Riberalta','Riberalta',1956,'#0b6672','#ffffff','Orilla Grande',16800,'Los del Río','Los del Río','Fútbol de toque',64),
('Atlético Bosqueceniza','Bosqueceniza',1968,'#174734','#858585','Las Cenizas',12600,'Los Forestales','El Bosque','Defensa férrea',64),
('Unión Costamar','Costamar',1939,'#65c7e8','#ef8070','Bahía del Sol',18200,'La Costa Brava','La Costa Brava','Ataque directo',63),
('Horizonte de Dunara','Dunara',1975,'#d6ae67','#ad2626','Las Dunas',13400,'Los del Desierto','La Caravana','Resistencia',62),
('Rayo de Pinarés','Pinarés',1963,'#f4d83e','#161616','El Relámpago',14900,'Los Rayos','La Tormenta','Velocidad',64),
('Deportivo Nublar','Nublar',1946,'#cdd1cf','#72c5ed','Neblina Alta',11600,'La Nube','La Nube','Control táctico',63),
('Atlético San Talio','San Talio',1921,'#1d57bb','#c83143','Campana Vieja',17500,'Los Campaneros','Los Campaneros','Tradición',65),
('Lobos de Quintera','Quintera',1984,'#692a40','#ffffff','Madriguera del Lobo',15300,'Los Lobos','La Manada','Presión física',63),
('Fénix de Istral','Istral',1999,'#d33123','#e9b43d','El Renacer',10800,'Las Alas','Las Alas del Fénix','Juventud y velocidad',64)]
foreign={
'Varkosia':[('Dinamo Korven','#185eb4','#ffffff','Estadio del Comando'),('Legión Varkos','#a11c32','#101116','Fortaleza Roja'),('Atlético Drest','#e5c02b','#191919','Arena Drest'),('Colosos de Mirkan','#737b84','#c73731','El Coloso')],
'Soleria':[('Solaris FC','#f3d234','#e77f28','Templo del Sol'),('Bahía de Nácar','#81d8e7','#ffffff','Arena Nácar'),('Tiburones de Aruma','#11428a','#111111','La Fosa'),('Atlético Coral','#f58c79','#1a775c','Jardines del Coral')],
'Keldria':[('Fjordheim FC','#6ba5d8','#f4f4f4','Palacio del Fiordo'),('Aurora de Vels','#8b55ac','#83d3e0','Luces del Norte'),('Atlético Glaciar','#ebedef','#17181d','Estadio Polar'),('Cóndores del Hielo','#326ca0','#bcbfc3','Nido Boreal')],
'Ravendia':[('Ferro Ravenda','#b82128','#f4f4f4','Horno Central'),('Ciudad de Vapor','#85868c','#ea7d32','La Caldera'),('Mecánicos de Vorta','#22334f','#c3c8d0','Arena del Motor'),('Unión Brasa','#82304b','#101010','Estadio de la Brasa')],
'Eldamar':[('Marítimo Eldamar','#1559a5','#dcaa36','Puerto Real'),('Reales de Farón','#f2f2f2','#d5a94d','Palacio de Farón'),('Fortaleza Azul','#10254f','#c2c3c8','Murallas del Este'),('Estrella del Faro','#eacc44','#f4f5f7','Faro Mayor')],
'Talmera':[('Racing Talmera','#1a8a58','#f4f4f4','Gran Pradera'),('Toros de Harvek','#c6232f','#815440','Plaza del Toro'),('Estepa Dorada','#d7ab30','#151515','Campo Dorado'),('Ciudad Viento','#235cb8','#e5cf3c','Estadio del Viento')],
'Zafiria':[('Imperio de Zafir','#d7af4e','#111111','Trono del Desierto'),('Dunas Rojas','#bc3131','#e5d2a4','Mar de Arena'),('Oasis Namar','#208a5c','#ffffff','Jardines de Namar'),('Lanceros de Qadir','#255ca6','#d7b54e','Palacio de las Lanzas')],
'Nemeria':[('Jaguares de Nemra','#171717','#dab238','Guarida Jaguar'),('Amazonas de Iru','#318e3a','#ead149','Río Sagrado'),('Verdes de Yari','#128e6b','#f6f6f6','Corazón Verde'),('Deportivo Liana','#3bbfc6','#151515','Selva Central')]
}
clubs=[]
for div,group,arr in [('LSV','A',A),('LSV','B',B),('LPV','S',S)]:
 for i,(name,city,founded,primary,secondary,stadium,capacity,nickname,fans,identity,rating) in enumerate(arr):
  clubs.append(dict(name=name,city=city,country='Veltrania',division=div,group=group,year=founded,primary=primary,secondary=secondary,stadium=stadium,capacity=capacity,nickname=nickname,fans=fans,identity=identity,rating=rating,budget=round((12 if div=='LSV' else 4)*rating/70,1)))
for country,arr in foreign.items():
 for i,(name,col1,col2,stadium) in enumerate(arr):
  clubs.append(dict(name=name,city=name.split(' de ')[-1].split(' ')[-1],country=country,division='EXT',group='',year=1910+(i*18)%85,primary=col1,secondary=col2,stadium=stadium,capacity=26000+i*4900,nickname=name.split(' ')[0],fans='La Hinchada '+name.split(' ')[0],identity='Identidad '+country,rating=66+(i*3)%12,budget=round(11+(i*2),1)))
assert len(clubs)==60
(p/'clubs.json').write_text(json.dumps(clubs,ensure_ascii=False,indent=2),encoding='utf8')
(p/'data.js').write_text('export const TEAMS = '+json.dumps(clubs,ensure_ascii=False,separators=(',',':'))+';\nexport const FIXTURES = '+(p/'fixtures.json').read_text(encoding='utf8').replace('\n','')+';\nexport const FOREIGN_COUNTRIES = '+json.dumps(list(foreign),ensure_ascii=False)+';\n',encoding='utf8')
print('generated',len(clubs),'data.js', (p/'data.js').stat().st_size)
