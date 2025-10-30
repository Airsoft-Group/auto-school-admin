import { ref, Ref } from 'vue';
import { userService } from '@/services/modules/user.service';

interface UseUsernameValidationOptions {
  isEdit?: boolean;
  initialUsername?: string;
}

interface FormWithUsername {
  firstName: string;
  lastName: string;
  username: string;
}

export function useUsernameValidation(form: Ref<FormWithUsername>, options: UseUsernameValidationOptions = {}) {
  const usernameExists = ref(false);
  const usernameChecking = ref(false);
  const usernameValidated = ref(false);
  const usernamePreviouslyGenerated = ref(false);
  let usernameDebounceTimer: number | null = null;

  const allowedPattern = /^[a-zA-Z0-9.]+$/;

  const checkUsernameValidity = async () => {
    // Don't validate empty usernames - the required validator will handle those
    if (!form.value.username) {
      usernameExists.value = false;
      usernameValidated.value = false;
      return;
    }

    // Check pattern validity first before making API calls
    if (!allowedPattern.test(form.value.username)) {
      usernameChecking.value = false;
      usernameValidated.value = false;
      return; // Don't proceed with API validation if pattern fails
    }

    // Clear any existing timer
    if (usernameDebounceTimer !== null) {
      clearTimeout(usernameDebounceTimer);
    }

    // Set checking state
    usernameChecking.value = true;

    // Debounce the API call to avoid too many requests
    usernameDebounceTimer = window.setTimeout(async () => {
      try {
        // Skip validation if this is an edit and the username hasn't changed
        if (options.isEdit && options.initialUsername === form.value.username) {
          usernameExists.value = false;
          usernameChecking.value = false;
          return;
        }

        const exists = await userService.checkExistingTeacherUsername(form.value.username);
        usernameExists.value = exists;
        usernameValidated.value = true;
      } catch (error) {
        console.error('Error checking username:', error);
        // We don't show warning messages to avoid noisy UI
      } finally {
        usernameChecking.value = false;
      }
    }, 300);
  };

  const generateUsername = () => {
    // Only generate if both first and last name have content
    if (form.value.firstName && form.value.lastName) {
      // Take first letter of first name in lowercase
      const firstInitial = form.value.firstName.charAt(0).toLowerCase();

      // Take last name, convert to lowercase
      let lastName = form.value.lastName.toLowerCase();

      // Transliterate Uzbek/Cyrillic characters if needed
      lastName = transliterateToLatin(lastName);

      // Create username in format: n.shoshiy
      const suggestedUsername = `${firstInitial}.${lastName}`;

      // Only set if the field is empty or was previously auto-generated
      if (!form.value.username || usernamePreviouslyGenerated.value) {
        form.value.username = suggestedUsername;
        usernamePreviouslyGenerated.value = true;

        // Trigger username validation
        checkUsernameValidity();
      }
    }
  };

  // Transliterate Uzbek/Cyrillic characters to Latin
  const transliterateToLatin = (text: string): string => {
    // Simple transliteration map for Uzbek characters
    const transliterationMap: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
      'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': '',
      'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ў': 'o', 'қ': 'q',
      'ғ': 'g', 'ҳ': 'h', 'Ғ': 'g', 'Қ': 'q', 'Ҳ': 'h', 'Ў': 'o',
      'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd', 'Е': 'e', 'Ё': 'yo',
      'Ж': 'j', 'З': 'z', 'И': 'i', 'Й': 'y', 'К': 'k', 'Л': 'l', 'М': 'm',
      'Н': 'n', 'О': 'o', 'П': 'p', 'Р': 'r', 'С': 's', 'Т': 't', 'У': 'u',
      'Ф': 'f', 'Х': 'x', 'Ц': 'ts', 'Ч': 'ch', 'Ш': 'sh', 'Щ': 'sh', 'Ъ': '',
      'Ы': 'i', 'Ь': '', 'Э': 'e', 'Ю': 'yu', 'Я': 'ya'
    };

    // Replace each character if it exists in the map
    return text.split('').map(char => transliterationMap[char] || char).join('');
  };

  return {
    usernameExists,
    usernameChecking,
    usernameValidated,
    usernamePreviouslyGenerated,
    allowedPattern,
    checkUsernameValidity,
    generateUsername
  };
}
