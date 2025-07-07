
import React from 'react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: "🎨",
      title: "Kreativní kreslení",
      description: "Plynulé kreslení s pokročilými nástroji"
    },
    {
      icon: "🌍",
      title: "Více jazyků",
      description: "Slovníky v češtině, angličtině a dalších"
    },
    {
      icon: "📱",
      title: "Všechna zařízení",
      description: "Perfektní na počítači i telefonu"
    }
  ];

  return (
    <div className="mt-20 text-center">
      <h2 className="text-3xl font-bold mb-12 text-gray-800 dark:text-white">
        Proč si zamilujete DrawGuess?
      </h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="text-center p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
