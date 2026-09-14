// src/components/Xia/concierge-i18n.ts
// UI chrome only. The assistant's own sentences come from the model in the
// selected language; these are the fixed strings around it.

export type Lang = "en" | "hi" | "kn";

export const LANGUAGES: Array<{ code: Lang; label: string; short: string }> = [
  { code: "en", label: "English", short: "EN" },
  { code: "hi", label: "हिन्दी", short: "हि" },
  { code: "kn", label: "ಕನ್ನಡ", short: "ಕ" },
];

type Strings = {
  eyebrow: string;
  heading: string;
  subheading: string;
  placeholder: string;
  start: string;
  skip: string;
  back: string;
  thinking: string;
  openDock: string;
  closeDock: string;
  restart: string;
  routeIntro: string;
  goThere: string;
  orBrowse: string;
  guidedNote: string;
  languageLabel: string;
  answered: string;
};

export const STRINGS: Record<Lang, Strings> = {
  en: {
    eyebrow: "XIA · Your guide",
    heading: "Tell me what you're actually trying to do.",
    subheading:
      "Two or three questions, then I'll put you exactly where you need to be. No forms, no sales call.",
    placeholder: "e.g. I'm a software architect in Bangalore, want Canada PR with my wife",
    start: "Start",
    skip: "Just let me explore",
    back: "Back",
    thinking: "Thinking",
    openDock: "Ask XIA",
    closeDock: "Close",
    restart: "Start over",
    routeIntro: "Here's where to go next",
    goThere: "Take me there",
    orBrowse: "Browse everything instead",
    guidedNote: "Guided mode",
    languageLabel: "Language",
    answered: "You said",
  },
  hi: {
    eyebrow: "XIA · आपका मार्गदर्शक",
    heading: "बताइए आप असल में क्या करना चाहते हैं।",
    subheading:
      "दो-तीन सवाल, और मैं आपको ठीक वहीं पहुँचा दूँगा जहाँ आपको होना चाहिए। न कोई फ़ॉर्म, न कोई सेल्स कॉल।",
    placeholder: "जैसे: मैं बेंगलुरु में सॉफ़्टवेयर आर्किटेक्ट हूँ, पत्नी के साथ कनाडा PR चाहिए",
    start: "शुरू करें",
    skip: "मुझे बस देखना है",
    back: "पीछे",
    thinking: "सोच रहा हूँ",
    openDock: "XIA से पूछें",
    closeDock: "बंद करें",
    restart: "फिर से शुरू करें",
    routeIntro: "आगे यहाँ जाइए",
    goThere: "वहाँ ले चलिए",
    orBrowse: "इसके बजाय सब देखें",
    guidedNote: "गाइडेड मोड",
    languageLabel: "भाषा",
    answered: "आपने कहा",
  },
  kn: {
    eyebrow: "XIA · ನಿಮ್ಮ ಮಾರ್ಗದರ್ಶಿ",
    heading: "ನೀವು ನಿಜವಾಗಿ ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ ಎಂದು ಹೇಳಿ.",
    subheading:
      "ಎರಡು ಮೂರು ಪ್ರಶ್ನೆಗಳು, ನಂತರ ನಿಮಗೆ ಬೇಕಾದ ಸ್ಥಳಕ್ಕೆ ನಿಖರವಾಗಿ ಕರೆದೊಯ್ಯುತ್ತೇನೆ. ಫಾರ್ಮ್ ಇಲ್ಲ, ಸೇಲ್ಸ್ ಕರೆ ಇಲ್ಲ.",
    placeholder: "ಉದಾ: ನಾನು ಬೆಂಗಳೂರಿನ ಸಾಫ್ಟ್‌ವೇರ್ ಆರ್ಕಿಟೆಕ್ಟ್, ಪತ್ನಿಯೊಂದಿಗೆ ಕೆನಡಾ PR ಬೇಕು",
    start: "ಪ್ರಾರಂಭಿಸಿ",
    skip: "ನಾನು ಸುಮ್ಮನೆ ನೋಡಬೇಕು",
    back: "ಹಿಂದೆ",
    thinking: "ಯೋಚಿಸುತ್ತಿದ್ದೇನೆ",
    openDock: "XIA ಅನ್ನು ಕೇಳಿ",
    closeDock: "ಮುಚ್ಚಿ",
    restart: "ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ",
    routeIntro: "ಮುಂದೆ ಇಲ್ಲಿಗೆ ಹೋಗಿ",
    goThere: "ಅಲ್ಲಿಗೆ ಕರೆದೊಯ್ಯಿ",
    orBrowse: "ಬದಲಿಗೆ ಎಲ್ಲವನ್ನೂ ನೋಡಿ",
    guidedNote: "ಗೈಡೆಡ್ ಮೋಡ್",
    languageLabel: "ಭಾಷೆ",
    answered: "ನೀವು ಹೇಳಿದ್ದು",
  },
};
