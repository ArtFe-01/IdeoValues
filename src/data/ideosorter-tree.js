/** Exact question wording and answer labels adapted from the supplied Ideosorter source. */
export const ideosorterTree = [
  {
    "id": "private_property",
    "text": "Should Private Property exist?",
    "options": [
      {
        "text": "Yes",
        "next": "theo"
      },
      {
        "text": "No",
        "next": "market"
      }
    ]
  },
  {
    "id": "theo",
    "text": "Should society be run by intermediaries to a deity?",
    "options": [
      {
        "text": "Yes",
        "next": "theocracy"
      },
      {
        "text": "No",
        "next": "distributism"
      }
    ]
  },
  {
    "id": "distributism",
    "text": "Should private property be made as widely owned as possible?",
    "options": [
      {
        "text": "Yes",
        "next": "distributism"
      },
      {
        "text": "No",
        "next": "conditional_land_ownership"
      }
    ]
  },
  {
    "id": "conditional_land_ownership",
    "text": "Should land ownership be conditional or unconditional?",
    "options": [
      {
        "text": "Conditional",
        "next": "scope_of_government2"
      },
      {
        "text": "Unconditional",
        "next": "scope_of_government1"
      }
    ]
  },
  {
    "id": "scope_of_government1",
    "text": "Should the scope of government be limited?",
    "options": [
      {
        "text": "Yes",
        "next": "watchman_state"
      },
      {
        "text": "No",
        "next": "tradvals"
      },
      {
        "text": "The state shouldn't exist",
        "next": "counter_economics"
      }
    ]
  },
  {
    "id": "watchman_state",
    "text": "Should the government purely be a night watchman state?",
    "options": [
      {
        "text": "Yes",
        "next": "minarch"
      },
      {
        "text": "No",
        "next": "welfare"
      }
    ]
  },
  {
    "id": "welfare",
    "text": "Should there be a focus on helping the disadvantaged?",
    "options": [
      {
        "text": "Yes",
        "next": "welfare_needed"
      },
      {
        "text": "No",
        "next": "limited_gov_tradvals"
      }
    ]
  },
  {
    "id": "welfare_needed",
    "text": "Would welfare be needed to help the disadvantaged under a deregulated market economy?",
    "options": [
      {
        "text": "Welfare",
        "next": "socbert"
      },
      {
        "text": "Not needed",
        "next": "bhl"
      }
    ]
  },
  {
    "id": "limited_gov_tradvals",
    "text": "Do you think a more limited government would lead to a resurgence in traditional values?",
    "options": [
      {
        "text": "Yes",
        "next": "paleobert"
      },
      {
        "text": "No",
        "next": "libert"
      }
    ]
  },
  {
    "id": "tradvals",
    "text": "In your ideal society, would traditional values be upheld?",
    "options": [
      {
        "text": "Yes",
        "next": "tradauthstate"
      },
      {
        "text": "No",
        "next": "govbasicneeds"
      }
    ]
  },
  {
    "id": "tradauthstate",
    "text": "Do you deem an authoritarian state necessary to secure the values and sovereignty of your nation?",
    "options": [
      {
        "text": "Yes",
        "next": "corp_cap"
      },
      {
        "text": "No",
        "next": "strong_safety_net"
      }
    ]
  },
  {
    "id": "corp_cap",
    "text": "Should the government embrace capitalism or corporatism?",
    "options": [
      {
        "text": "Capitalism",
        "next": "markreg"
      },
      {
        "text": "Corporatism",
        "next": "unions_vs_state"
      }
    ]
  },
  {
    "id": "markreg",
    "text": "Should the market be closely regulated?",
    "options": [
      {
        "text": "Yes",
        "next": "socnat"
      },
      {
        "text": "No",
        "next": "nazcap"
      }
    ]
  },
  {
    "id": "unions_vs_state",
    "text": "Should the economy be organized by unions, or by the state?",
    "options": [
      {
        "text": "Unions",
        "next": "natsynd"
      },
      {
        "text": "State",
        "next": "clergygov"
      }
    ]
  },
  {
    "id": "clergygov",
    "text": "Should the clergy be a part of government?",
    "options": [
      {
        "text": "Yes",
        "next": "clerfash"
      },
      {
        "text": "No",
        "next": "racesuperior"
      }
    ]
  },
  {
    "id": "racesuperior",
    "text": "Do you deem your race to be superior above all others?",
    "options": [
      {
        "text": "Yes",
        "next": "nazi"
      },
      {
        "text": "No",
        "next": "fascism"
      }
    ]
  },
  {
    "id": "strong_safety_net",
    "text": "Should there be a strong social safety net for the disadvantaged in society?",
    "options": [
      {
        "text": "Yes",
        "next": "patcon"
      },
      {
        "text": "No",
        "next": "intervgov"
      }
    ]
  },
  {
    "id": "intervgov",
    "text": "Should the government intervene in wars that do not directly interfere with your country's national sovereignty?",
    "options": [
      {
        "text": "Yes",
        "next": "neocon"
      },
      {
        "text": "No",
        "next": "paleocon"
      }
    ]
  },
  {
    "id": "govbasicneeds",
    "text": "Should the government provide the basic necessities to its citizens?",
    "options": [
      {
        "text": "Yes",
        "next": "socdem"
      },
      {
        "text": "No",
        "next": "econreg"
      }
    ]
  },
  {
    "id": "econreg",
    "text": "Should the economy be tightly regulated?",
    "options": [
      {
        "text": "Yes",
        "next": "lib"
      },
      {
        "text": "No",
        "next": "neolib"
      }
    ]
  },
  {
    "id": "counter_economics",
    "text": "Should counter-economics be the focus of bringing about an ideal society?",
    "options": [
      {
        "text": "Yes",
        "next": "agorism"
      },
      {
        "text": "No",
        "next": "coop_ancap"
      }
    ]
  },
  {
    "id": "coop_ancap",
    "text": "Do you think that a completely deregulated, stateless society will lead to a market dominated by worker co-operatives?",
    "options": [
      {
        "text": "Yes",
        "next": "leftroth"
      },
      {
        "text": "No",
        "next": "ancap"
      }
    ]
  },
  {
    "id": "scope_of_government2",
    "text": "Should the scope of government be limited?",
    "options": [
      {
        "text": "Yes",
        "next": "geolib"
      },
      {
        "text": "No",
        "next": "landwelfare"
      },
      {
        "text": "The state shouldn't exist",
        "next": "angeo"
      }
    ]
  },
  {
    "id": "landwelfare",
    "text": "Should the revenue from land value taxes be put primarily towards welfare?",
    "options": [
      {
        "text": "Yes",
        "next": "socgeo"
      },
      {
        "text": "No",
        "next": "georgism"
      }
    ]
  },
  {
    "id": "market",
    "text": "Should the market mechanism drive the allocation of goods?",
    "options": [
      {
        "text": "Yes",
        "next": "statesoc"
      },
      {
        "text": "No",
        "next": "marx"
      }
    ]
  },
  {
    "id": "statesoc",
    "text": "Should there be a strong authoritarian state to protect the working class from foreign nations?",
    "options": [
      {
        "text": "Yes",
        "next": "tito"
      },
      {
        "text": "No",
        "next": "marksoc"
      },
      {
        "text": "The state shouldn't exist",
        "next": "mutualaid"
      }
    ]
  },
  {
    "id": "mutualaid",
    "text": "Should the economy be based around the principles of mutual aid?",
    "options": [
      {
        "text": "Yes",
        "next": "racism"
      },
      {
        "text": "No",
        "next": "lwma"
      }
    ]
  },
  {
    "id": "racism",
    "text": "Should communities be made up of ethnically homogenous populations?",
    "options": [
      {
        "text": "Yes",
        "next": "natan"
      },
      {
        "text": "No",
        "next": "mutualism"
      }
    ]
  },
  {
    "id": "marx",
    "text": "Should the goal of our society be to move towards a classless, moneyless and stateless society?",
    "options": [
      {
        "text": "Yes",
        "next": "transstate"
      },
      {
        "text": "No",
        "next": "techno"
      }
    ]
  },
  {
    "id": "transstate",
    "text": "Is a transitory state necessary to reach this goal?",
    "options": [
      {
        "text": "Yes",
        "next": "soc_directstate1"
      },
      {
        "text": "No",
        "next": "labvouch"
      }
    ]
  },
  {
    "id": "soc_directstate1",
    "text": "Should the workers directly own the means of production in this stage, or should the state be in control of them?",
    "options": [
      {
        "text": "Workers",
        "next": "rev_ed"
      },
      {
        "text": "State",
        "next": "vanguard"
      }
    ]
  },
  {
    "id": "vanguard",
    "text": "Is a vanguard party necessary to lead the working class in the revolution?",
    "options": [
      {
        "text": "Yes",
        "next": "vanguard_ed"
      },
      {
        "text": "No",
        "next": "orthmarx"
      }
    ]
  },
  {
    "id": "vanguard_ed",
    "text": "Should the role of this vanguard party be only to educate? As opposed to being some form of political leadership.",
    "options": [
      {
        "text": "Yes",
        "next": "castro"
      },
      {
        "text": "No",
        "next": "cultural_revolution"
      }
    ]
  },
  {
    "id": "cultural_revolution",
    "text": "Should there be a cultural revolution to purge reactionary thought from society?",
    "options": [
      {
        "text": "Yes",
        "next": "3worlds"
      },
      {
        "text": "No",
        "next": "nep"
      }
    ]
  },
  {
    "id": "3worlds",
    "text": "Do you subscribe to Mao Zedong's Three Worlds Theory?",
    "options": [
      {
        "text": "Yes",
        "next": "mao"
      },
      {
        "text": "No",
        "next": "mlm"
      }
    ]
  },
  {
    "id": "nep",
    "text": "Do you think that a multi-generational stage of state capitalism is necessary to prepare the economy for socialism?",
    "options": [
      {
        "text": "Yes",
        "next": "deng"
      },
      {
        "text": "No",
        "next": "socinone"
      }
    ]
  },
  {
    "id": "socinone",
    "text": "Do you think that socialism can be achieved within one nation?",
    "options": [
      {
        "text": "Yes",
        "next": "aboveall1"
      },
      {
        "text": "No",
        "next": "posadism"
      }
    ]
  },
  {
    "id": "aboveall1",
    "text": "Do you think that the nation should be of most importance above all?",
    "options": [
      {
        "text": "Yes",
        "next": "nazbol"
      },
      {
        "text": "No",
        "next": "ml"
      }
    ]
  },
  {
    "id": "posadism",
    "text": "Do you think an apocalyptic event would be the best way to achieve socialism?",
    "options": [
      {
        "text": "Yes",
        "next": "posadism"
      },
      {
        "text": "No",
        "next": "trot"
      }
    ]
  },
  {
    "id": "rev_ed",
    "text": "Should there be a revolutionary party to teach the masses during and after the revolution?",
    "options": [
      {
        "text": "Yes",
        "next": "synd1"
      },
      {
        "text": "No",
        "next": "mediabad"
      }
    ]
  },
  {
    "id": "synd1",
    "text": "Should society be organized through unions?",
    "options": [
      {
        "text": "Yes",
        "next": "deleon"
      },
      {
        "text": "No",
        "next": "centplan"
      }
    ]
  },
  {
    "id": "centplan",
    "text": "Should the economy be planned centrally?",
    "options": [
      {
        "text": "Yes",
        "next": "bordiga"
      },
      {
        "text": "No",
        "next": "luxem"
      }
    ]
  },
  {
    "id": "mediabad",
    "text": "Is mass media your focal issue with capitalism?",
    "options": [
      {
        "text": "Yes",
        "next": "situationist"
      },
      {
        "text": "No",
        "next": "councom"
      }
    ]
  },
  {
    "id": "labvouch",
    "text": "Should society feature labour vouchers as compensation for work?",
    "options": [
      {
        "text": "Yes",
        "next": "ancol"
      },
      {
        "text": "No",
        "next": "agriculture"
      }
    ]
  },
  {
    "id": "agriculture",
    "text": "Should agriculture be practiced?",
    "options": [
      {
        "text": "Yes",
        "next": "synd2"
      },
      {
        "text": "No",
        "next": "anprim"
      }
    ]
  },
  {
    "id": "synd2",
    "text": "Should society be organized through unions?",
    "options": [
      {
        "text": "Yes",
        "next": "ansynd"
      },
      {
        "text": "No",
        "next": "ancom"
      }
    ]
  },
  {
    "id": "techno",
    "text": "Should the state and/or economy be run exclusively by experts?",
    "options": [
      {
        "text": "Yes",
        "next": "technocracy"
      },
      {
        "text": "No",
        "next": "electsoc"
      }
    ]
  },
  {
    "id": "electsoc",
    "text": "Should socialism be achieved through electoralism or through revolutionary means?",
    "options": [
      {
        "text": "Electoralism",
        "next": "demsoc"
      },
      {
        "text": "Revolution",
        "next": "soc_directstate2"
      }
    ]
  },
  {
    "id": "soc_directstate2",
    "text": "Should the workers directly own the means of production or should the state be in control of them?",
    "options": [
      {
        "text": "Workers",
        "next": "agriculture_industrial"
      },
      {
        "text": "State",
        "next": "esobullshit"
      }
    ]
  },
  {
    "id": "esobullshit",
    "text": "Should class/nation be the main subject of political discussion, or should it be the Dasein (human essence)?",
    "options": [
      {
        "text": "Dasein",
        "next": "4theory"
      },
      {
        "text": "Class/Nation",
        "next": "bankjews"
      }
    ]
  },
  {
    "id": "bankjews",
    "text": "Do you believe that the source economic problems faced by workers is down to Jewish bankers?",
    "options": [
      {
        "text": "Yes",
        "next": "strasser"
      },
      {
        "text": "No",
        "next": "aboveall2"
      }
    ]
  },
  {
    "id": "aboveall2",
    "text": "Do you think that the nation should be of most importance above all?",
    "options": [
      {
        "text": "Yes",
        "next": "nazbol"
      },
      {
        "text": "No",
        "next": "statesoc"
      }
    ]
  },
  {
    "id": "agriculture_industrial",
    "text": "Should society be focused more on agriculture than on industrial work?",
    "options": [
      {
        "text": "Yes",
        "next": "agsoc"
      },
      {
        "text": "No",
        "next": "synd3"
      }
    ]
  },
  {
    "id": "synd3",
    "text": "Should society be organized through unions?",
    "options": [
      {
        "text": "Yes",
        "next": "synd"
      },
      {
        "text": "No",
        "next": "libsoc"
      }
    ]
  }
];
export const ideosorterLabels = {
  "4theory": "You're a Fourth Theorist",
  "agorism": "You're an Agorist",
  "agsoc": "You're an Agrarian Socialist",
  "ancap": "You're an Anarcho-Capitalist",
  "ancol": "You're an Anarcho-Collectivist",
  "ancom": "You're an Anarcho-Communist",
  "angeo": "You're a Geoanarchist",
  "anprim": "You're an Anarcho-Primitivist",
  "ansynd": "You're an Anarcho-Syndicalist",
  "bhl": "You're a Bleeding-Heart Libertarian",
  "bordiga": "You're a Bordigist/Italian Left-Communist",
  "castro": "You're a Castroist",
  "fascism": "You're a Classical Fascist",
  "clerfash": "You're a Clerical Fascist",
  "councom": "You're a Council Communist",
  "deleon": "You're a De Leonist",
  "demsoc": "You're a Democratic Socialist",
  "deng": "You're a Dengist/Socialist with Chinese Characteristics",
  "distributism": "You're a Distributist",
  "geolib": "You're a Geolibertarian",
  "georgism": "You're a Georgist",
  "leftroth": "You're a Left-Rothbardian",
  "libert": "You're a Right-Libertarian",
  "libsoc": "You're a Libertarian Socialist",
  "lib": "You're a Keynesian Liberal",
  "luxem": "You're a Luxemburgist",
  "lwma": "You're a Left-Wing Market Anarchist",
  "mao": "You're a Maoist",
  "marksoc": "You're a Market Socialist",
  "minarch": "You're a Minarchist",
  "mlm": "You're a Marxist–Leninist–Maoist",
  "ml": "You're a Marxist–Leninist",
  "mutualism": "You're a Mutualist",
  "natan": "You're a National Anarchist",
  "natsynd": "You're a National Syndicalist",
  "nazbol": "You're a National Bolshevik",
  "nazcap": "You're a National Capitalist",
  "nazi": "You're a National Socialist",
  "neocon": "You're a Neoconservative",
  "neolib": "You're a Neoliberal",
  "orthmarx": "You're an Orthodox Marxist",
  "paleobert": "You're a Paleolibertarian",
  "paleocon": "You're a Paleoconservative",
  "patcon": "You're a Paternalistic Conservative",
  "posadism": "You're a Posadist",
  "situationist": "You're a Situationist",
  "socbert": "You're a Social Libertarian",
  "socdem": "You're a Social Democrat",
  "socgeo": "You're a Social Georgist",
  "socnat": "You're a Social Nationalist",
  "statesoc": "You're a State Socialist",
  "strasser": "You're a Strasserist",
  "synd": "You're a Syndicalist",
  "technocracy": "You're a Technocrat",
  "theocracy": "You're a Theocrat",
  "tito": "You're a Titoist",
  "trot": "You're a Trotskyist"
};

