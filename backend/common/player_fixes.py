"""
common/player_fixes.py
Hand-kept corrections to 09's automatic player matching.
"""

# Names that don't match: understat_player_id -> Transfermarkt player_id
TRANSFERMARKT_IDS = {
    965: 15799,  # Santiago Cazorla -> Santi Cazorla
    1521: 244275,  # Gabriel -> Gabriel Barbosa
    2034: 2904,  # Rafael Márquez -> Rafa Márquez
    4428: 85928,  # Daniel Lafferty -> Danny Lafferty
    5114: 139434,  # Raúl García -> Raúl Carnero
    5195: 345473,  # Nicolás Schiappacase -> Nicolás Schiappacasse
    6120: 207834,  # Bono -> Yassine Bounou
    6434: 354361,  # Franck Zambo -> Frank Anguissa
    6495: 299715,  # Koke -> Koke Vegas
    6879: 495669,  # Mohamed Lamine Diaby -> Lamine Diaby-Fadiga
    7784: 381724,  # Joao Victor -> Victor Sá
    7947: 207877,  # Ruslan Malinovskiy -> Ruslan Malinovskyi
    7981: 538996,  # Nianzou Kouassi -> Tanguy Nianzou
    7983: 346482,  # Daniel N'Lundulu -> Dan Nlundulu
    8094: 607223,  # Mathis Cherki -> Rayan Cherki
    8271: 627294,  # Fernando Niño -> Fer Niño
    10981: 895480,  # Malcom Adu -> Adu Ares
    11866: 193082,  # Álex Grimaldo -> Alejandro Grimaldo
    12030: 523318,  # Tasos Douvikas -> Anastasios Douvikas
    13787: 638124,  # Manuel Fernández -> Manu Fernández
}

# Names that don't match, or namesakes mixed up: understat_player_id -> FotMob player id
FOTMOB_IDS = {
    15: 51841,  # Júnior Díaz (Darmstadt)
    50: 49885,  # Gonzalo Jara (Mainz 05)
    61: 132843,  # Geoffroy Serey Dié -> Serey Dié
    77: 309496,  # Jin-Su Kim -> Kim Jin-Su
    123: 36180,  # Assani Lukimya -> Assani Lukimya-Mulongoti
    284: 106309,  # Carlos Zambrano (Eintracht Frankfurt)
    401: 114044,  # Álvaro Domínguez (Borussia Mönchengladbach)
    471: 23895,  # Shaun MacDonald (AFC Bournemouth)
    562: 718876,  # James Weir (Manchester United)
    578: 165773,  # Juan Carlos Paredes -> Juan Paredes
    796: 24393,  # Gary O'Neil (Norwich City)
    869: 170429,  # Dionatan Teixeira -> Dionatan do Nascimento Teixeira
    932: 38759,  # Danny Graham (Sunderland)
    937: 299258,  # João Teixeira (Liverpool)
    1004: 30630,  # Joe Cole (Aston Villa)
    1043: 729449,  # Callum Connolly (Everton)
    1060: 281480,  # Jonathan Williams (Crystal Palace)
    1521: 450848,  # Gabriel -> Gabriel Barbosa
    1815: 26564,  # Alex (Milan)
    1824: 34305,  # Maicon (Roma)
    1885: 134236,  # Tino Costa -> Alberto Costa
    1907: 212767,  # Jerry Mbakogu -> Jerry Uche Mbakogu
    1914: 741141,  # Aaron Mattia Tabacchi -> Aaron Tabacchi
    1937: 175646,  # Fernando (Sampdoria)
    1946: 671621,  # Pepín -> José Machín
    1967: 387499,  # Gilberto (Fiorentina)
    1985: 68436,  # Marcelo Estigarribia (Atalanta)
    2025: 41629,  # Matuzalém -> Francelino Matuzalem
    2034: 30740,  # Rafael Márquez (Hellas Verona)
    2061: 97498,  # Beto (Sevilla)
    2067: 561433,  # Juan Muñoz (Sevilla)
    2076: 150080,  # Miguel Lopes (Granada)
    2078: 30914,  # Ricardo Costa (Granada)
    2119: 314947,  # Rober Correa -> Roberto Correa
    2139: 33959,  # Ion Ansotegi -> Ion Ansotegui
    2140: 242151,  # Borja Ekiza -> Ekiza
    2161: 406257,  # Nacho (Valladolid) -> Nacho Martínez
    2171: 111975,  # Manucho (Rayo Vallecano)
    2173: 710807,  # Joni Montiel -> Jonathan Montiel
    2177: 30276,  # David Navarro (Levante)
    2178: 37484,  # Juanfran (Levante)
    2205: 37449,  # Juan Rodríguez (Getafe)
    2312: 96651,  # Manu -> Manu Fernandez
    2327: 495107,  # Jonathan Rodríguez (Deportivo A Coruña)
    2343: 573463,  # Juanpi -> Juan Añor
    2448: 39719,  # Juan Vargas (Real Betis)
    2450: 389202,  # Wanderson (Getafe)
    2459: 282687,  # Álex Barrera (Sporting Gijón)
    2469: 674492,  # Matos -> José Matos
    2472: 529285,  # Bernard Mensah (Getafe)
    2529: 574905,  # Borja Fernández (Celta Vigo)
    2546: 189178,  # Juan Domínguez (Deportivo A Coruña)
    2558: 256727,  # Lass -> Alhassane Bangoura
    2579: 362194,  # Nicolás López (Granada)
    2583: 673749,  # Miguel Cardoso (Deportivo A Coruña)
    2729: 20396,  # Felipe Santana (Schalke 04)
    3249: 26402,  # Mohamed Fofana (Reims)
    3368: 213319,  # Junior Tallo -> Tallo
    3382: 103485,  # Jules Goda -> Jules Stephane Goda
    3392: 346004,  # Lucas Silva (Marseille)
    3407: 263276,  # Adryan (Nantes)
    3418: 30911,  # Ricardo Carvalho (Monaco)
    3452: 158845,  # Pape Paye -> Pape Abdou Paye
    3465: 34417,  # Alain Traoré -> Alain Sibiri Traoré
    3499: 277384,  # Gael Angoula (Angers)
    3610: 354482,  # Mory Kone -> Mory Koné
    3774: 560942,  # Alexis Araujo -> Alexis Araújo
    3813: 356378,  # Luka Djordjevic (Sampdoria)
    3822: 185925,  # Luis Pedro Cavanda -> Luis Cavanda
    3823: 39334,  # Cristian Ledesma (Lazio)
    3860: 128047,  # Zé Eduardo (Cesena)
    3865: 11560,  # Davide Succi (Cesena)
    3869: 161662,  # Dejan Lazarevic -> Dejan Lazarević
    3870: 30865,  # Nemanja Vidic -> Nemanja Vidić
    3871: 32118,  # Lukas Podolski (Arsenal)
    3882: 409812,  # Isaac Donkor (Inter)
    3897: 19285,  # Rafael Marques (Hellas Verona)
    3901: 33422,  # Guillermo Rodríguez (Hellas Verona)
    3914: 168569,  # Alejandro González (Cagliari)
    3932: 173609,  # Ivan Martic (Hellas Verona)
    3937: 24405,  # Daniele Conti (Cagliari)
    4001: 268261,  # Stefan Ristovski (Parma)
    4016: 128360,  # Edimar (Córdoba)
    4022: 94044,  # Granddi N'Goyi -> Granddi Ngoyi
    4039: 205034,  # Álex López (Celta Vigo)
    4047: 202220,  # Wellington -> Wellington Silva
    4071: 213812,  # Íñigo López (Córdoba)
    4072: 309537,  # Deivid (Córdoba)
    4079: 179404,  # Patrick Ekeng -> Patrick Ekeng Ekeng
    4081: 251256,  # Javier Espinosa -> Espinosa González
    4093: 39854,  # Xavi -> Xavi Hernández
    4121: 113695,  # Cristian Álvarez (Rayo Vallecano)
    4135: 183498,  # Javi Lara (Eibar)
    4148: 115798,  # Babá -> Papa Baba Diawara
    4156: 211118,  # Rafael Martins (Levante)
    4159: 282460,  # Guillermo -> Guillermo Fernández
    4211: 183346,  # Víctor Pérez (Levante)
    4325: 25990,  # João Pereira (Hannover 96)
    4356: 178774,  # Julian Koch (Mainz 05)
    4362: 354495,  # Junior Malanda -> Junior Malanda-Adje
    4390: 36374,  # Robert Green (Queens Park Rangers)
    4404: 24890,  # Ryan Taylor (Newcastle United)
    4411: 35480,  # Alex Bruce (Hull City)
    4428: 193501,  # Daniel Lafferty (Burnley)
    4492: 37475,  # José Enrique (Liverpool)
    4495: 210804,  # Liam Moore (Leicester City)
    4704: 25657,  # Ismael Bangoura -> Ismaël Bangoura
    4711: 35121,  # Jesper Juelsgaard -> Jesper Juelsgård
    4724: 31014,  # Romaric (SC Bastia)
    4753: 174062,  # Carlos Eduardo -> Eduardo
    4820: 116253,  # Juan Manuel Falcón -> Juan Falcón
    4834: 609735,  # Malick Seck -> Elhadji Malick Seck
    4889: 202443,  # Vincent Aboubakar (Lorient)
    4892: 149583,  # Lucas Mendes (Marseille)
    5114: 195698,  # Raúl García -> Raúl Carnero
    5195: 643161,  # Nicolás Schiappacase -> Nicolás Schiappacasse
    5821: 192504,  # Alexander Merkel (Udinese)
    6305: 882349,  # Ismail Aaneb -> Ismaël Aaneba
    6434: 612863,  # Franck Zambo -> Frank Anguissa
    6495: 785824,  # Koke -> Koke Vegas
    6879: 906950,  # Mohamed Lamine Diaby -> Lamine Diaby-Fadiga
    7265: 980793,  # Kephren Thuram -> Khéphren Thuram-Ulien
    7784: 660846,  # Joao Victor -> Victor Sá
    7947: 459658,  # Ruslan Malinovskiy -> Ruslan Malinovsky
    7981: 1070617,  # Nianzou Kouassi -> Tanguy Nianzou
    7983: 789599,  # Daniel N'Lundulu -> Dan Nlundulu
    8151: 1078166,  # Hianga'a M'Bock -> Hiang'a Mbock
    8271: 1127224,  # Fernando Niño -> Fer Niño
    8410: 1158514,  # Rodrigo Sánchez -> Rodri
    8807: 959404,  # Silas Wamangituka -> Silas Katompa Mvumpa
    9704: 181877,  # Vasilios Lampropoulos -> Vassilios Lambropoulos
    10576: 1190025,  # Álvaro Fernández -> Alvaro Carreras
    10981: 1331037,  # Malcom Adu -> Adu Ares
    11249: 1428550,  # Ousmane Camara -> Ousmane Nana Camara
    11537: 1470001,  # Santiago García -> Santi García
    11831: 1414859,  # Samu Omorodion -> Samuel Aghehowa
    13271: 1553774,  # Adrián Arnu -> Adrián Arnuncio
    13294: 1678830,  # García Pascual -> Álvaro Pascual
}

# Namesakes wrongly matched, with no FotMob page found: these show initials
NOT_ON_FOTMOB = {
    2350,  # Cifuentes (Elche)
    2451,  # Miguel Ángel (Getafe)
    3776,  # Diego Gomez (Angers)
    3825,  # Álvaro González (Lazio)
    3895,  # Fernandinho (Hellas Verona)
    3988,  # Nenê (Hellas Verona)
    4106,  # Roberto (Granada)
    4117,  # José Ángel (Elche)
    4143,  # Samu (Elche)
    4197,  # Sergio García (Córdoba)
    4215,  # José Carlos (Córdoba)
    4435,  # Nenê (West Ham United)
}

# Names FotMob gets wrong: understat_player_id -> name to show
DISPLAY_NAMES = {
    281: "Lukáš Hrádecký",
    453: "Son Heung-min",
    491: "Petr Čech",
    723: "Ki Sung-yueng",
    813: "Salomón Rondón",
    1246: "Kostas Manolas",
    1257: "Alisson",
    1505: "Samir Handanović",
    1534: "Giancarlo González",
    1663: "Jóhann Berg Gudmundsson",
    1720: "Didier Ndong",
    1741: "Zlatan Ibrahimović",
    2090: "Marc-André ter Stegen",
    2197: "Pedro León",
    2233: "Xabi Prieto",
    2266: "Saúl Ñíguez",
    2303: "Samu Castillejo",
    2385: "Mat Ryan",
    2392: "Gorka Iraizoz",
    2397: "Beñat",
    3294: "Edinson Cavani",
    3416: "Danijel Subašić",
    3526: "Ronny Rodelin",
    3600: "Serge Aurier",
    3848: "Carlos Tevez",
    4070: "Borja García",
    4136: "Ángel Rodríguez",
    5043: "Kiko Femenía",
    5136: "Pervis Estupiñán",
    5622: "Júlio Tavares",
    5706: "Dodi Lukebakio",
    5769: "Habib Diallo",
    5803: "Fodé Ballo-Touré",
    6082: "Jiří Pavlenka",
    6292: "Tomáš Koubek",
    6630: "Joe Willock",
    6766: "Dani Vivian",
    6986: "Hamed Traorè",
    7265: "Khéphren Thuram",
    7313: "Lee Kang-in",
    7382: "Dan Burn",
    7700: "Che Adams",
    7810: "Ruben Vargas",
    7829: "Éder Militão",
    7947: "Ruslan Malinovskyi",
    8056: "Arnaud Kalimuendo",
    8288: "Tomáš Souček",
    8665: "Loïc Badé",
    8777: "Vitinha",
    8807: "Silas",
    9674: "Joe Scally",
    9755: "Íñigo Ruiz de Galarreta",
    10974: "Samú Costa",
    11486: "Illia Zabarnyi",
}

# Players whose Transfermarkt position (their current one) is wrong for their
# Understat years: understat_player_id -> FW, MF, DF or GK
POSITION_OVERRIDES = {}
