import React from 'react';
import { HomeScreen } from '../src/screens/home';

const HomeRoute: React.FC = () => {
  return (
    <HomeScreen
      onOpenCalendar={() => console.log('Open calendar')}
      onOpenMood={() => console.log('Open mood')}
      onOpenNotes={() => console.log('Open notes')}
      onOpenMemories={() => console.log('Open memories')}
      onAnswerPrompt={() => console.log('Answer prompt')}
    />
  );
};

export default HomeRoute;
