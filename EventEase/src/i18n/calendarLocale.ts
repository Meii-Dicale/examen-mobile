/**
 * Noms des mois et des jours en français pour react-native-calendars.
 * La librairie est en anglais par défaut ; LocaleConfig est un réglage global,
 * il suffit d'importer ce fichier une fois (dans l'onglet Calendrier).
 */

import { LocaleConfig } from 'react-native-calendars';

import { fr } from './fr';

LocaleConfig.locales.fr = {
  monthNames: [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ],
  monthNamesShort: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  dayNames: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  dayNamesShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  today: fr.calendar.today,
};
LocaleConfig.defaultLocale = 'fr';
