import React, { useState } from 'react';
import { Experience } from './components/Experience';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.SCATTERED);

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeState.SCATTERED ? TreeState.TREE_SHAPE : TreeState.SCATTERED
    );
  };

  const isTree = treeState === TreeState.TREE_SHAPE;

  return (
    <div className="relative w-full h-screen bg-black">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Experience treeState={treeState} />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8">
        {/* Header */}
        <header className="flex justify-between items-start">
          <div className="bg-black/30 backdrop-blur-md p-4 rounded-lg border border-emerald-900/50">
            <h1 className="text-emerald-400 text-sm tracking-[0.3em] font-light uppercase">
              Arix Signature
            </h1>
            <h2 className="text-amber-100 text-2xl font-serif mt-1">
              Interactive Christmas
            </h2>
          </div>
        </header>

        {/* Footer / Controls */}
        <footer className="flex justify-center pb-8">
          <button
            onClick={toggleState}
            className={`
              pointer-events-auto
              px-8 py-4 rounded-full 
              text-sm font-bold tracking-widest uppercase
              transition-all duration-700 ease-out
              border-2 
              shadow-[0_0_20px_rgba(0,0,0,0.5)]
              ${isTree 
                ? 'bg-gradient-to-r from-amber-200 to-yellow-500 text-black border-yellow-400 hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] scale-110' 
                : 'bg-emerald-950/80 text-emerald-400 border-emerald-600 hover:bg-emerald-900 hover:border-emerald-400'
              }
            `}
          >
            {isTree ? 'Scramble Elements' : 'Assemble Tree'}
          </button>
        </footer>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-900/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-yellow-900/20 to-transparent pointer-events-none" />
    </div>
  );
};

export default App;
