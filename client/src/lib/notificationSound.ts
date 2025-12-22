// Notification Sound Utility

// Create notification sound using Web Audio API
const createNotificationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const playNotification = () => {
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };
  
  return playNotification;
};

// Fallback using Audio element with data URI
const playSimpleNotification = () => {
  try {
    // Simple notification beep sound (data URI)
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwPUKfl8LVjHAU7k9n0yXksBSJ1yPDdj0AHElyw6OyrWBYLR6Dh87pqHgcrhM/y2og2CBxrvPDjm04MEFCn5fC1Yh0GOpLY8sp5KwUidcjw3I9BBhNcr+jrq1gWC0eg4PO6aR8HK4TP8tmINQgca7zv45pPDBBPp+Xwsl8dBjmS2fTIeCsFInXI8NyPQQYTXK/o66pYFgtHoN/zuGofByuEz/LZhzUIG2q78OKZTwwPT6fl8LJfHQY5ktnzyHgrBSJ1yPDcj0EGE1yv6OuqWBYLR6Df87hqIAcrhM/y2Yc1CBtqu/DimE8MD0+n5fCyXx0GOJLa88l5KwYidsnw3I9BBhNcr+jrqVgWC0eg3/O4ah8HK4TP8tmHNQgbar3w4phPDA9Pp+Xwsl8dBjiS2vPKeCsGInXJ8NuPQQYTXK/o66lYFgtHoN/zuGsfByuEz/LZhzQIG2q98OGYTwwPT6fl8LJfHQY4ktr0yXgrBiJ1yfDbj0EGE1yv6OuoWRYLR6Df87hrIAcrhM/y2Yc1CBtqvfDhmE8MD0+n5fCyXx0GOJLa9Ml5KwYidcnw249BBhNcr+jrqFkWC0eg3/O4ayAHK4TP8tmHNQgbar3w4ZhPDA9Pp+Xwsl8dBjiS2vTJeSsGInXJ8NuPQQYTXK/o66hZFgtHoN/zuGsgByuEz/LZhzUIG2q98OGYTwwPT6fl8LJfHQY4ktr0yXkrBiJ1yfDbj0EGE1yv6OuoWBYMR6Df87hrHwcrhc/y2Yc1CBxqvfDhmE8MD0+n5fCyXx0GOJLa9Ml5KwYidcnw249BBhNcr+jrqFgWC0eg3/O4ax8HK4XP8tmHNQgcar3w4ZhPDA9Pp+Xwsl8dBjiS2vTJeSsGInXJ8NuPQQYTXK/o66hYFgtHoN/zuGsfByuFz/LZhzUIG2q98OGYTwwPT6fl8LJfHQY4ktr0yXkrBiJ1yfDbj0EGE1yv6OuoWBYLR6Df87hrHwcrhc/y2Yc1CBtqvfDhmE8MD0+n5fCyXx0GOJLa9Ml5KwYidcnw249BBhNcr+jrqFgWC0eg3/O4ax8HK4XP8tmHNQgbar3w4ZhPDA9Pp+Xwsl8dBjiS2vTJeSsGInXJ8NuPQQYTXK/o66hYFgtHoN/zuGsfByuFz/LZhzUIG2q98OGYTwwPT6fl8LJfHQY4ktr0yXkrBiJ1yfDbj0EGE1yv6OuoWBYLR6Df87hrHwcrhc/y2Yc1CBtqvfDhmE8MD0+n5fCyXx0GOJLa9Ml5KwYidcnw249BBhNcr+jrqFgWC0eg3/O4ax8HK4XP8tmHNAgbar3w4ZhPDA9Pp+Xwsl8dBjiS2vTJeSsGInXJ8NuPQQYTXK/o66hYFgtHoN/zuGsfByuFz/LZhzUIG2q98OGYTwwPT6fl8LJfHQY4ktr0yXkrBiJ1yfDbj0EGE1yv6OuoWBYLR6Df87hrHwcrhc/y2Yc1CBtqvfDhmE8MD0+n5fCyXh0GOJPa9Ml5KwYidcnw249BBhNcr+jrqFgWC0eg3/O4ax8HK4XP8tmHNQgbar3w4ZhPDA9Pp+Xwsl4dBjiT2vTJeSsGInXJ8NuPQQYTXK/o66hYFgtHoN/zuGsfByuFz/LZhzUIG2q98OGYTwwPT6fl8LJeHQY=');
    audio.volume = 0.5;
    audio.play().catch((error) => {
      console.error('Failed to play audio:', error);
    });
  } catch (error) {
    console.error('Failed to create audio:', error);
  }
};

let notificationSound: (() => void) | null = null;

export const initNotificationSound = () => {
  try {
    notificationSound = createNotificationSound();
  } catch (error) {
    console.warn('Web Audio API not supported, using fallback');
    notificationSound = playSimpleNotification;
  }
};

export const playMessageSound = () => {
  if (!notificationSound) {
    initNotificationSound();
  }
  notificationSound?.();
};

// Check if user has granted notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  }
};

// Show browser notification
export const showBrowserNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options
      });
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }
};
