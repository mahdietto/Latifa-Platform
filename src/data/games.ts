export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface GameData {
  fableId: string;
  fableTitle: string;
  type: "quiz" | "moraleScramble" | "association";
  questions?: QuizQuestion[];
  scrambleWords?: string[];
  correctMoral?: string;
}

export const fableGames: GameData[] = [
  {
    fableId: "corbeau-renard",
    fableTitle: "Le Corbeau et le Renard",
    type: "quiz",
    questions: [
      {
        question: "Que tenait le Corbeau dans son bec ?",
        options: ["Un ver", "Un fromage", "Une cerise", "Un poisson"],
        correctIndex: 1,
      },
      {
        question: "Que fait le Renard pour tromper le Corbeau ?",
        options: ["Il le menace", "Il lui offre un cadeau", "Il le flatte", "Il l'ignore"],
        correctIndex: 2,
      },
      {
        question: "Quelle est la morale de cette fable ?",
        options: [
          "Il faut travailler dur",
          "Tout flatteur vit aux dépens de celui qui l'écoute",
          "L'union fait la force",
          "Rien ne sert de courir",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    fableId: "cigale-fourmi",
    fableTitle: "La Cigale et la Fourmi",
    type: "quiz",
    questions: [
      {
        question: "Que faisait la Cigale pendant l'été ?",
        options: ["Elle travaillait", "Elle dormait", "Elle chantait", "Elle voyageait"],
        correctIndex: 2,
      },
      {
        question: "Que demande la Cigale à la Fourmi ?",
        options: ["Un abri", "De la nourriture", "De l'argent", "Un manteau"],
        correctIndex: 1,
      },
      {
        question: "La Fourmi accepte-t-elle d'aider la Cigale ?",
        options: ["Oui, avec joie", "Oui, mais à contrecœur", "Non, elle refuse", "Elle hésite"],
        correctIndex: 2,
      },
    ],
  },
  {
    fableId: "lievre-tortue",
    fableTitle: "Le Lièvre et la Tortue",
    type: "quiz",
    questions: [
      {
        question: "Pourquoi le Lièvre perd-il la course ?",
        options: ["Il se blesse", "Il s'endort", "Il se perd", "Il abandonne"],
        correctIndex: 1,
      },
      {
        question: "Quelle qualité de la Tortue lui permet de gagner ?",
        options: ["Sa vitesse", "Sa persévérance", "Sa ruse", "Sa force"],
        correctIndex: 1,
      },
      {
        question: "Complète la morale : « Rien ne sert de courir... »",
        options: [
          "il faut partir à point",
          "il faut être le plus fort",
          "il faut avoir des amis",
          "il faut être malin",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    fableId: "lion-rat",
    fableTitle: "Le Lion et le Rat",
    type: "quiz",
    questions: [
      {
        question: "Que fait le Lion quand il attrape le Rat ?",
        options: ["Il le mange", "Il le laisse partir", "Il le garde prisonnier", "Il le chasse"],
        correctIndex: 1,
      },
      {
        question: "Comment le Rat aide-t-il le Lion ?",
        options: ["Il appelle à l'aide", "Il ronge les filets", "Il effraie les chasseurs", "Il creuse un tunnel"],
        correctIndex: 1,
      },
      {
        question: "Quelle est la morale ?",
        options: [
          "On a souvent besoin d'un plus petit que soi",
          "La force prime sur tout",
          "Il ne faut jamais aider personne",
          "Les grands mangent les petits",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    fableId: "loup-agneau",
    fableTitle: "Le Loup et l'Agneau",
    type: "quiz",
    questions: [
      {
        question: "Où l'Agneau se désaltère-t-il ?",
        options: ["Dans un lac", "Dans un ruisseau", "Dans une mare", "Dans une fontaine"],
        correctIndex: 1,
      },
      {
        question: "De quoi le Loup accuse-t-il l'Agneau ?",
        options: ["De voler sa nourriture", "De troubler son eau", "De l'insulter", "De mentir"],
        correctIndex: 1,
      },
      {
        question: "Que signifie « La raison du plus fort est toujours la meilleure » ?",
        options: [
          "Le plus intelligent gagne toujours",
          "Le plus fort impose sa volonté, même injustement",
          "Il faut toujours avoir raison",
          "La force physique est la plus importante",
        ],
        correctIndex: 1,
      },
    ],
  },
];

export interface MoralMatch {
  fableTitle: string;
  moral: string;
}

export const moralMatchGame: MoralMatch[] = [
  { fableTitle: "Le Corbeau et le Renard", moral: "Tout flatteur vit aux dépens de celui qui l'écoute." },
  { fableTitle: "La Cigale et la Fourmi", moral: "Il faut se préparer pour les jours de nécessité." },
  { fableTitle: "Le Lièvre et la Tortue", moral: "Rien ne sert de courir, il faut partir à point." },
  { fableTitle: "Le Lion et le Rat", moral: "On a souvent besoin d'un plus petit que soi." },
  { fableTitle: "Le Loup et l'Agneau", moral: "La raison du plus fort est toujours la meilleure." },
  { fableTitle: "Le Renard et les Raisins", moral: "Il est facile de mépriser ce que l'on ne peut obtenir." },
];
