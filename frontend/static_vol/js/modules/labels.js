'use strict';

import { labels_en } from './labels_en.js';
import { labels_ja } from './labels_ja.js';
import { labels_fr } from './labels_fr.js';

export const languageLabels = {
    'en': labels_en,
    'ja': labels_ja,
    'fr': labels_fr,
};

export const labels = {};

export const switchLabels = (lang) => {
    Object.assign(labels, languageLabels[lang]);
};
