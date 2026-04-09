import React from 'react';

const TextMenuItem = ({ dish }) => {
  return (
    <div className="mb-8 group text-left">
      <div className="flex justify-between items-baseline gap-4 mb-1">
        <h3 className="text-xl font-sans font-bold tracking-tight text-white group-hover:text-[#DC2626] transition-colors duration-300">
          {dish.name}
          <span className="flex items-center gap-1.5 ml-2 mb-1 inline-flex">
            {(dish.type === 'veg' || dish.type === 'both') && (
              <span className="text-[10px] inline-block border border-green-600 p-[1px] leading-none">
                <span className="block w-1.5 h-1.5 bg-green-600 rounded-full"></span>
              </span>
            )}
            {(dish.type === 'non-veg' || dish.type === 'both') && (
              <span className="text-[10px] inline-block border border-red-600 p-[1px] leading-none">
                <span className="block w-1.5 h-1.5 bg-red-600 rounded-full"></span>
              </span>
            )}
          </span>
        </h3>
        <div className="flex-grow border-b border-dotted border-white/20 mb-1 mx-2"></div>
        <span className="text-xl font-sans font-bold text-white whitespace-nowrap">
          {typeof dish.price === 'number' ? `₹${dish.price}` : dish.price}
        </span>
      </div>
      <p className="text-[10px] text-var(--text-secondary) leading-relaxed uppercase tracking-[0.2em] max-w-[90%] font-light italic">
        {dish.description}
      </p>
      {dish.meta && (
        <p className="text-[10px] text-[#DC2626] mt-1 uppercase tracking-[0.1em] font-medium">
          {dish.meta}
        </p>
      )}
    </div>
  );
};

const TextMenu = ({ dishes }) => {
  // Group dishes by category
  const groupedDishes = dishes.reduce((acc, dish) => {
    const cat = dish.category || 'MAINS';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(dish);
    return acc;
  }, {});

  const categoryOrder = ['STARTER', 'MAINS', 'DESSERT'];
  
  const sortedCategories = Object.keys(groupedDishes).sort((a, b) => {
    let indexA = categoryOrder.indexOf(a);
    let indexB = categoryOrder.indexOf(b);
    if (indexA === -1) indexA = 99;
    if (indexB === -1) indexB = 99;
    return indexA - indexB;
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 text-white text-center">
      {/* Categories */}
      {sortedCategories.map((category) => {
        const items = groupedDishes[category];
        
        // Custom sub-grouping for STARTER (Big Plate)
        const bigPlateItems = items.filter(d => d.id === 'calcutta-street' || d.id.startsWith('banglar-chaat'));
        const normalStarterItems = items.filter(d => !bigPlateItems.includes(d));

        return (
          <div key={category} className="mb-24">
            <div className="flex items-center justify-center mb-12">
              <div className="h-[0.5px] flex-grow bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <h2 className="px-10 text-sm font-display italic tracking-[0.5em] uppercase opacity-40 whitespace-nowrap">
                • {category} •
              </h2>
              <div className="h-[0.5px] flex-grow bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2">
              {category === 'STARTER' ? (
                <>
                  {normalStarterItems.map((dish) => (
                    <TextMenuItem key={dish.id} dish={dish} />
                  ))}
                  
                  {bigPlateItems.length > 0 && (
                    <div className="col-span-1 md:col-span-2 mt-12 mb-8">
                       <h3 className="text-xs font-display tracking-[0.4em] uppercase opacity-40 font-bold mb-10">• Big Plate •</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2 text-left">
                          {bigPlateItems.map((dish) => (
                            <TextMenuItem key={dish.id} dish={dish} />
                          ))}
                       </div>
                    </div>
                  )}
                </>
              ) : (
                items.map((dish) => (
                  <TextMenuItem key={dish.id} dish={dish} />
                ))
              )}
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div className="text-center mt-20 pt-10 border-t border-white/5 opacity-30">
        <p className="text-[9px] tracking-[0.3em] font-light uppercase italic">* 5% GST to be added</p>
      </div>
    </div>
  );
};

export default TextMenu;
