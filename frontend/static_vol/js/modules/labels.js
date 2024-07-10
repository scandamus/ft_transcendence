'use strict';

import { labels_en } from './labels_en.js';
import { labels_ja } from './labels_ja.js';
import { labels_fr } from './labels_fr.js';
import { labels_la } from './labels_la.js';
import { labels_he } from './labels_he.js';
import { labels_ar } from './labels_ar.js';

const languageLabels = {
    'en': labels_en,
    'ja': labels_ja,
    'fr': labels_fr,
    'la': labels_la,
    'he': labels_he,
    'ar': labels_ar,
};

export const getCurrentLanguageLabels = (lang) => {
    const label = languageLabels[lang] || labels_en;
    return label;
}

//export const labels = labels_ja;
export const labels = {};

export const switchLabels = (lang) => {
    console.log('!switchLabels!', labels, '=>', getCurrentLanguageLabels(lang));
    Object.assign(labels, getCurrentLanguageLabels(lang));
};
