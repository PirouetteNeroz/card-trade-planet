
/**
 * Utilitaire pour le débogage des traductions
 * Active les logs de débogage pour les traductions
 */
export const enableTranslationDebug = true;

/**
 * Log de débogage pour les traductions
 * @param message Message à logger
 * @param data Données additionnelles
 */
export function logTranslation(message: string, data?: any): void {
  if (enableTranslationDebug) {
    if (data) {
      console.log(`[Translation] ${message}`, data);
    } else {
      console.log(`[Translation] ${message}`);
    }
  }
}
