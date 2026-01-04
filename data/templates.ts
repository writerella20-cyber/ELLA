
export interface Template {
    id: string;
    name: string;
    description: string;
    category: 'Business' | 'Personal' | 'Academic' | 'Creative' | 'Scriptwriting' | 'Education' | 'Fiction' | 'Non-Fiction';
    content: string;
  }
  
  export const DOMAIN_TEMPLATES: Template[] = [
    // --- FICTION TEMPLATES ---
    {
        id: '27-chapter-method',
        name: '27-Chapter Method',
        description: 'Popularized by Kat O’Keeffe. Breaks the story into 3 Acts, each with 9 specific blocks to ensure even pacing.',
        category: 'Fiction',
        content: `
            <div class="max-w-4xl mx-auto space-y-6">
                <div class="text-center border-b-2 border-indigo-100 pb-6">
                    <h1 class="text-4xl font-bold text-indigo-900">27-Chapter Method Outline</h1>
                    <p class="text-gray-500 mt-2">A structural roadmap for perfect pacing.</p>
                </div>

                <div class="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                    <h2 class="text-2xl font-bold text-indigo-800 mb-4">ACT I: The Setup</h2>
                    <div class="space-y-4">
                        <div class="bg-white p-4 rounded shadow-sm">
                            <h3 class="font-bold text-gray-900">Block 1: Introduction</h3>
                            <p class="text-sm text-gray-600"><strong>Ch 1:</strong> Intro to Protagonist & Status Quo.</p>
                            <p class="text-sm text-gray-600"><strong>Ch 2:</strong> Intro to the Flaw/Wound.</p>
                            <p class="text-sm text-gray-600"><strong>Ch 3:</strong> Introduction of the stakes/world.</p>
                        </div>
                        <div class="bg-white p-4 rounded shadow-sm">
                            <h3 class="font-bold text-gray-900">Block 2: Inciting Incident</h3>
                            <p class="text-sm text-gray-600"><strong>Ch 4:</strong> The Catalyst (Inciting Incident).</p>
                            <p class="text-sm text-gray-600"><strong>Ch 5:</strong> Debate/Refusal of the Call.</p>
                            <p class="text-sm text-gray-600"><strong>Ch 6:</strong> Deciding to Act.</p>
                        </div>
                        <div class="bg-white p-4 rounded shadow-sm">
                            <h3 class="font-bold text-gray-900">Block 3: Immediate Reaction</h3>
                            <p class="text-sm text-gray-600"><strong>Ch 7:</strong> Crossing the Threshold (Plot Point 1).</p>
                            <p class="text-sm text-gray-600"><strong>Ch 8:</strong> Exploring the New World (Fun & Games start).</p>
                            <p class="text-sm text-gray-600"><strong>Ch 9:</strong> First major conflict/realization.</p>
                        </div>
                    </div>
                </div>

                <div class="bg-purple-50 p-6 rounded-xl border border-purple-100">
                    <h2 class="text-2xl font-bold text-purple-800 mb-4">ACT II: The Middle</h2>
                    <div class="space-y-4">
                        <div class="bg-white p-4 rounded shadow-sm">
                            <h3 class="font-bold text-gray-900">Block 4: The Pressure</h3>
                            <p class="text-sm text-gray-600"><strong>Ch 10:</strong> Allies & Enemies established.</p>
                            <p class="text-sm text-gray-600"><strong>Ch 11:</strong> The Plan begins.</p>
                            <p class="text-sm text-gray-600"><strong>Ch 12:</strong> The Plan fails/complicates.</p>
                        </div>
                        <div class="bg-white p-4 rounded shadow-sm">
                            <h3 class="font-bold text-gray-900">Block 5: The Pinch</h3>
                            <p class="text-sm text-gray-600"><strong>Ch 13:</strong> Pinch Point 1 (Antagonist force shows power).</p>
                            <p class="text-sm text-gray-600"><strong>Ch 14:</strong> The Midpoint (Realization/Shift).</p>
                            <p class="text-sm text-gray-600"><strong>Ch 15:</strong> Reaction to Midpoint.</p>
                        </div>
                        <div class="bg-white p-4 rounded shadow-sm">
                            <h3 class="font-bold text-gray-900">Block 6: The Push</h3>
                            <p class="text-sm text-gray-600"><strong>Ch 16:</strong> New Plan formulated.</p>
                            <p class="text-sm text-gray-600"><strong>Ch 17:</strong> Execution of New Plan.</p>
                            <p class="text-sm text-gray-600"><strong>Ch 18:</strong> Success... but at a cost.</p>
                        </div>
                    </div>
                </div>

                <div class="bg-amber-50 p-6 rounded-xl border border-amber-100">
                    <h2 class="text-2xl font-bold text-amber-800 mb-4">ACT III: The Resolution</h2>
                    <div class="space-y-4">
                        <div class="bg-white p-4 rounded shadow-sm">
                            <h3 class="font-bold text-gray-900">Block 7: The New World</h3>
                            <p class="text-sm text-gray-600"><strong>Ch 19:</strong> Pinch Point 2 (All Hope is Lost).</p>
                            <p class="text-sm text-gray-600"><strong>Ch 20:</strong> Dark Night of the Soul.</p>
                            <p class="text-sm text-gray-600"><strong>Ch 21:</strong> The Aha! Moment.</p>
                        </div>
                        <div class="bg-white p-4 rounded shadow-sm">
                            <h3 class="font-bold text-gray-900">Block 8: The Resolution</h3>
                            <p class="text-sm text-gray-600"><strong>Ch 22:</strong> Gathering the team/resources.</p>
                            <p class="text-sm text-gray-600"><strong>Ch 23:</strong> Storming the Castle.</p>
                            <p class="text-sm text-gray-600"><strong>Ch 24:</strong> The Climax (Final Battle).</p>
                        </div>
                        <div class="bg-white p-4 rounded shadow-sm">
                            <h3 class="font-bold text-gray-900">Block 9: The Aftermath</h3>
                            <p class="text-sm text-gray-600"><strong>Ch 25:</strong> Immediate aftermath.</p>
                            <p class="text-sm text-gray-600"><strong>Ch 26:</strong> Establishing the New Status Quo.</p>
                            <p class="text-sm text-gray-600"><strong>Ch 27:</strong> Final Image.</p>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: 'heros-journey',
        name: "Hero's Journey",
        description: "Joseph Campbell's classic monomyth structure. Perfect for epics, fantasy, and adventure.",
        category: 'Fiction',
        content: `
            <div class="max-w-4xl mx-auto">
                <h1 class="text-4xl font-serif font-bold text-center mb-8">The Hero's Journey</h1>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="p-6 border-l-4 border-blue-500 bg-gray-50">
                        <h3 class="font-bold text-lg uppercase text-blue-900">1. The Ordinary World</h3>
                        <p class="text-gray-700 mt-2">Introduce the Hero in their normal life. Highlight their flaw or what is missing.</p>
                    </div>
                    
                    <div class="p-6 border-l-4 border-blue-500 bg-gray-50">
                        <h3 class="font-bold text-lg uppercase text-blue-900">2. The Call to Adventure</h3>
                        <p class="text-gray-700 mt-2">Something disrupts the status quo and presents a challenge or quest.</p>
                    </div>

                    <div class="p-6 border-l-4 border-blue-500 bg-gray-50">
                        <h3 class="font-bold text-lg uppercase text-blue-900">3. Refusal of the Call</h3>
                        <p class="text-gray-700 mt-2">The Hero fears the unknown and considers turning back.</p>
                    </div>

                    <div class="p-6 border-l-4 border-blue-500 bg-gray-50">
                        <h3 class="font-bold text-lg uppercase text-blue-900">4. Meeting the Mentor</h3>
                        <p class="text-gray-700 mt-2">The Hero meets someone who provides training, equipment, or advice.</p>
                    </div>

                    <div class="p-6 border-l-4 border-purple-500 bg-gray-50">
                        <h3 class="font-bold text-lg uppercase text-purple-900">5. Crossing the Threshold</h3>
                        <p class="text-gray-700 mt-2">The Hero commits to the adventure and enters the Special World.</p>
                    </div>

                    <div class="p-6 border-l-4 border-purple-500 bg-gray-50">
                        <h3 class="font-bold text-lg uppercase text-purple-900">6. Tests, Allies, Enemies</h3>
                        <p class="text-gray-700 mt-2">The Hero explores the new world, learns the rules, and faces minor challenges.</p>
                    </div>

                    <div class="p-6 border-l-4 border-purple-500 bg-gray-50">
                        <h3 class="font-bold text-lg uppercase text-purple-900">7. Approach to the Inmost Cave</h3>
                        <p class="text-gray-700 mt-2">Preparations for the major ordeal. The stakes rise.</p>
                    </div>

                    <div class="p-6 border-l-4 border-purple-500 bg-gray-50">
                        <h3 class="font-bold text-lg uppercase text-purple-900">8. The Ordeal</h3>
                        <p class="text-gray-700 mt-2">A major crisis or battle. The Hero faces death or their greatest fear.</p>
                    </div>

                    <div class="p-6 border-l-4 border-green-500 bg-gray-50">
                        <h3 class="font-bold text-lg uppercase text-green-900">9. The Reward (Seizing the Sword)</h3>
                        <p class="text-gray-700 mt-2">The Hero claims the prize or insight won by enduring the Ordeal.</p>
                    </div>

                    <div class="p-6 border-l-4 border-green-500 bg-gray-50">
                        <h3 class="font-bold text-lg uppercase text-green-900">10. The Road Back</h3>
                        <p class="text-gray-700 mt-2">The Hero must return home, but the antagonist forces rally for one last push.</p>
                    </div>

                    <div class="p-6 border-l-4 border-green-500 bg-gray-50">
                        <h3 class="font-bold text-lg uppercase text-green-900">11. The Resurrection</h3>
                        <p class="text-gray-700 mt-2">The final test. The Hero is reborn and transformed.</p>
                    </div>

                    <div class="p-6 border-l-4 border-green-500 bg-gray-50">
                        <h3 class="font-bold text-lg uppercase text-green-900">12. Return with the Elixir</h3>
                        <p class="text-gray-700 mt-2">The Hero returns home with the power or knowledge to heal their ordinary world.</p>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: 'three-act-structure',
        name: 'Three-Act Structure',
        description: 'The foundational industry standard. Setup, Confrontation, and Resolution.',
        category: 'Fiction',
        content: `
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-10">
                    <h1 class="text-4xl font-bold uppercase tracking-widest">Three-Act Structure</h1>
                    <p class="text-gray-500 mt-2">The classic storytelling framework.</p>
                </div>

                <div class="space-y-8">
                    <div class="border-l-4 border-blue-500 pl-6 py-2">
                        <h2 class="text-2xl font-bold text-blue-900">Act I: The Setup</h2>
                        <p class="text-gray-600 mb-4 italic">Introduction to the characters, the world, and the conflict (~25%).</p>
                        
                        <div class="space-y-4">
                            <div>
                                <h3 class="font-bold">1. Exposition</h3>
                                <p>Establish the status quo. Who is the hero? What is their normal life?</p>
                            </div>
                            <div>
                                <h3 class="font-bold">2. Inciting Incident</h3>
                                <p>The event that disrupts the status quo and presents a problem/opportunity.</p>
                            </div>
                            <div>
                                <h3 class="font-bold">3. Plot Point 1</h3>
                                <p>The hero decides to engage with the problem. They leave their normal world. (Transition to Act II)</p>
                            </div>
                        </div>
                    </div>

                    <div class="border-l-4 border-purple-500 pl-6 py-2">
                        <h2 class="text-2xl font-bold text-purple-900">Act II: The Confrontation</h2>
                        <p class="text-gray-600 mb-4 italic">The hero faces obstacles, fails, learns, and grows (~50%).</p>
                        
                        <div class="space-y-4">
                            <div>
                                <h3 class="font-bold">4. Rising Action</h3>
                                <p>A series of obstacles and challenges. The stakes get higher.</p>
                            </div>
                            <div>
                                <h3 class="font-bold">5. Midpoint</h3>
                                <p>A major event that shifts the hero's perspective or understanding. The "point of no return".</p>
                            </div>
                            <div>
                                <h3 class="font-bold">6. Plot Point 2 (All Hope is Lost)</h3>
                                <p>The hero hits rock bottom. They must gather the strength for the final battle. (Transition to Act III)</p>
                            </div>
                        </div>
                    </div>

                    <div class="border-l-4 border-green-500 pl-6 py-2">
                        <h2 class="text-2xl font-bold text-green-900">Act III: The Resolution</h2>
                        <p class="text-gray-600 mb-4 italic">The final battle and the new normal (~25%).</p>
                        
                        <div class="space-y-4">
                            <div>
                                <h3 class="font-bold">7. Climax</h3>
                                <p>The hero faces the antagonist/conflict one last time. The highest point of tension.</p>
                            </div>
                            <div>
                                <h3 class="font-bold">8. Falling Action</h3>
                                <p>The immediate aftermath of the climax. Loose ends are tied up.</p>
                            </div>
                            <div>
                                <h3 class="font-bold">9. Resolution</h3>
                                <p>The new status quo is established. The hero has changed.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: 'story-circle',
        name: 'Story Circle',
        description: 'Dan Harmon’s simplified 8-step cycle focusing on character change. "You, Need, Go, Search, Find, Take, Return, Change".',
        category: 'Fiction',
        content: `
            <div class="max-w-3xl mx-auto font-sans">
                <div class="text-center mb-12">
                    <h1 class="text-3xl font-bold">The Story Circle</h1>
                    <p class="text-gray-500">A cycle of order into chaos and back again.</p>
                </div>

                <div class="space-y-2 relative">
                    <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    <div class="relative pl-12 py-4">
                        <div class="absolute left-0 top-6 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold z-10">1</div>
                        <h3 class="font-bold text-xl">YOU (Zone of Comfort)</h3>
                        <p class="text-gray-700">Establish the protagonist in a state of comfort or status quo.</p>
                    </div>

                    <div class="relative pl-12 py-4">
                        <div class="absolute left-0 top-6 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold z-10">2</div>
                        <h3 class="font-bold text-xl">NEED (But they want something)</h3>
                        <p class="text-gray-700">The status quo is insufficient. A need or desire creates a lack.</p>
                    </div>

                    <div class="relative pl-12 py-4">
                        <div class="absolute left-0 top-6 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold z-10">3</div>
                        <h3 class="font-bold text-xl">GO (They enter an unfamiliar situation)</h3>
                        <p class="text-gray-700">Crossing the threshold into chaos/adventure.</p>
                    </div>

                    <div class="relative pl-12 py-4">
                        <div class="absolute left-0 top-6 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold z-10">4</div>
                        <h3 class="font-bold text-xl">SEARCH (Adapt to it)</h3>
                        <p class="text-gray-700">The road of trials. They hunt for what they need.</p>
                    </div>

                    <div class="relative pl-12 py-4">
                        <div class="absolute left-0 top-6 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold z-10">5</div>
                        <h3 class="font-bold text-xl">FIND (They get what they wanted)</h3>
                        <p class="text-gray-700">Success or discovery. Often the midpoint.</p>
                    </div>

                    <div class="relative pl-12 py-4">
                        <div class="absolute left-0 top-6 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold z-10">6</div>
                        <h3 class="font-bold text-xl">TAKE (Pay a heavy price)</h3>
                        <p class="text-gray-700">Success comes with a cost. Loss or sacrifice.</p>
                    </div>

                    <div class="relative pl-12 py-4">
                        <div class="absolute left-0 top-6 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold z-10">7</div>
                        <h3 class="font-bold text-xl">RETURN (To their familiar situation)</h3>
                        <p class="text-gray-700">Bringing it back home. The climax often happens here.</p>
                    </div>

                    <div class="relative pl-12 py-4">
                        <div class="absolute left-0 top-6 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold z-10">8</div>
                        <h3 class="font-bold text-xl">CHANGE (Having changed)</h3>
                        <p class="text-gray-700">They are master of both worlds. The character has evolved.</p>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: 'save-the-cat',
        name: 'Save the Cat! (27 Beat)',
        description: 'Adaptation of Jessica Brody’s famous method. 15 core beats subdivided into a complete chapter outline.',
        category: 'Fiction',
        content: `
            <div class="max-w-4xl mx-auto">
                <div class="border-b-4 border-yellow-400 pb-4 mb-8">
                    <h1 class="text-4xl font-bold uppercase tracking-wide">Save the Cat! <span class="text-yellow-500">Sheet</span></h1>
                </div>

                <div class="space-y-8">
                    <section>
                        <h2 class="bg-gray-800 text-white p-2 font-bold uppercase">Act I: The Normal World</h2>
                        <div class="mt-4 grid gap-4">
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded">
                                <span class="text-xs font-bold text-gray-400 uppercase">1%</span>
                                <h3 class="font-bold">Opening Image</h3>
                                <p class="text-sm">A "before" snapshot of the hero and their world.</p>
                            </div>
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded">
                                <span class="text-xs font-bold text-gray-400 uppercase">5%</span>
                                <h3 class="font-bold">Theme Stated</h3>
                                <p class="text-sm">Usually spoken to the hero. What the story is really about.</p>
                            </div>
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded">
                                <span class="text-xs font-bold text-gray-400 uppercase">1-10%</span>
                                <h3 class="font-bold">Setup</h3>
                                <p class="text-sm">Expand on the status quo and the hero's flaws.</p>
                            </div>
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded">
                                <span class="text-xs font-bold text-gray-400 uppercase">10%</span>
                                <h3 class="font-bold">Catalyst</h3>
                                <p class="text-sm">Life changing event. Knocking down the house of cards.</p>
                            </div>
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded">
                                <span class="text-xs font-bold text-gray-400 uppercase">10-20%</span>
                                <h3 class="font-bold">Debate</h3>
                                <p class="text-sm">Can I do this? Dare I?</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 class="bg-gray-800 text-white p-2 font-bold uppercase">Act II: The Upside Down World</h2>
                        <div class="mt-4 grid gap-4">
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded">
                                <span class="text-xs font-bold text-gray-400 uppercase">20%</span>
                                <h3 class="font-bold">Break into Two</h3>
                                <p class="text-sm">The hero chooses to act. Crossing the threshold.</p>
                            </div>
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded">
                                <span class="text-xs font-bold text-gray-400 uppercase">22%</span>
                                <h3 class="font-bold">B Story</h3>
                                <p class="text-sm">Introduction of the love interest or mentor character who carries the theme.</p>
                            </div>
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded">
                                <span class="text-xs font-bold text-gray-400 uppercase">20-50%</span>
                                <h3 class="font-bold">Fun and Games</h3>
                                <p class="text-sm">The promise of the premise. Highlights of the genre.</p>
                            </div>
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded">
                                <span class="text-xs font-bold text-gray-400 uppercase">50%</span>
                                <h3 class="font-bold">Midpoint</h3>
                                <p class="text-sm">False Victory or False Defeat. Stakes are raised.</p>
                            </div>
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded">
                                <span class="text-xs font-bold text-gray-400 uppercase">50-75%</span>
                                <h3 class="font-bold">Bad Guys Close In</h3>
                                <p class="text-sm">Internal and external forces tighten the grip.</p>
                            </div>
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded">
                                <span class="text-xs font-bold text-gray-400 uppercase">75%</span>
                                <h3 class="font-bold">All Hope is Lost</h3>
                                <p class="text-sm">The whiff of death. Everything is gone.</p>
                            </div>
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded">
                                <span class="text-xs font-bold text-gray-400 uppercase">75-80%</span>
                                <h3 class="font-bold">Dark Night of the Soul</h3>
                                <p class="text-sm">Wallowing in the loss. Digging deep for the answer.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 class="bg-gray-800 text-white p-2 font-bold uppercase">Act III: Resolution</h2>
                        <div class="mt-4 grid gap-4">
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded">
                                <span class="text-xs font-bold text-gray-400 uppercase">80%</span>
                                <h3 class="font-bold">Break into Three</h3>
                                <p class="text-sm">The solution is found (thanks to B Story).</p>
                            </div>
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded">
                                <span class="text-xs font-bold text-gray-400 uppercase">80-99%</span>
                                <h3 class="font-bold">Finale</h3>
                                <p class="text-sm">Storming the castle. The test of the change.</p>
                            </div>
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded">
                                <span class="text-xs font-bold text-gray-400 uppercase">100%</span>
                                <h3 class="font-bold">Final Image</h3>
                                <p class="text-sm">Mirror of opening image, showing the change.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `
    },
    {
        id: 'seven-point-story',
        name: 'Seven-Point Story',
        description: 'Dan Wells’ system focusing on plot progression: Hook, Plot Pt 1, Pinch 1, Midpoint, Pinch 2, Plot Pt 2, Resolution.',
        category: 'Fiction',
        content: `
            <div class="max-w-3xl mx-auto space-y-6">
                <h1 class="text-3xl font-bold text-center border-b pb-4">Seven-Point Structure</h1>
                
                <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-indigo-500">
                    <h2 class="font-bold text-xl text-indigo-900">1. The Hook</h2>
                    <p class="text-gray-700">Start with the protagonist in their current state. Establish the status quo that needs to change.</p>
                </div>

                <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
                    <h2 class="font-bold text-xl text-blue-900">2. Plot Point 1</h2>
                    <p class="text-gray-700">Call to action. The character sets the story in motion (Act I break).</p>
                </div>

                <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-yellow-500">
                    <h2 class="font-bold text-xl text-yellow-900">3. Pinch Point 1</h2>
                    <p class="text-gray-700">Pressure is applied. Introduce the antagonist or the stakes clearly.</p>
                </div>

                <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-purple-500">
                    <h2 class="font-bold text-xl text-purple-900">4. Midpoint</h2>
                    <p class="text-gray-700">The character moves from reaction to action. They determine to solve the problem.</p>
                </div>

                <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-yellow-500">
                    <h2 class="font-bold text-xl text-yellow-900">5. Pinch Point 2</h2>
                    <p class="text-gray-700">Increased pressure. All is lost moment. The jaws of defeat.</p>
                </div>

                <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
                    <h2 class="font-bold text-xl text-blue-900">6. Plot Point 2</h2>
                    <p class="text-gray-700">The final piece of the puzzle. The character realizes what they must do to win.</p>
                </div>

                <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-green-500">
                    <h2 class="font-bold text-xl text-green-900">7. Resolution</h2>
                    <p class="text-gray-700">The climax and the aftermath. Success or failure, but the character is changed.</p>
                </div>
            </div>
        `
    },
    {
        id: 'romancing-the-beat',
        name: 'Romancing the Beat',
        description: 'Specifically designed for romance authors. Outlines the emotional milestones required for the genre.',
        category: 'Fiction',
        content: `
            <div class="max-w-3xl mx-auto">
                <div class="text-center mb-8">
                    <h1 class="text-4xl font-serif text-pink-600 font-bold">Romance Beat Sheet</h1>
                    <p class="text-gray-500 italic">Based on Gwen Hayes' "Romancing the Beat"</p>
                </div>

                <div class="space-y-6">
                    <div>
                        <h2 class="text-xl font-bold text-pink-800 border-b border-pink-200 mb-2">Phase 1: Setup</h2>
                        <ul class="list-disc pl-5 space-y-2 text-gray-700">
                            <li><strong>Intro H1 & H2:</strong> Introduce both leads and their "ghosts" (emotional wounds).</li>
                            <li><strong>Meet Cute:</strong> The first interaction. Sparks fly (good or bad).</li>
                            <li><strong>No Way 1:</strong> Reason why they can't be together.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 class="text-xl font-bold text-pink-800 border-b border-pink-200 mb-2">Phase 2: Falling in Love</h2>
                        <ul class="list-disc pl-5 space-y-2 text-gray-700">
                            <li><strong>The Adhesion:</strong> External force forces them together.</li>
                            <li><strong>No Way 2:</strong> Reminder of why this is a bad idea.</li>
                            <li><strong>Inkling of Desire:</strong> Maybe it's worth it?</li>
                            <li><strong>Deepening Desire:</strong> Physical/Emotional intimacy grows.</li>
                            <li><strong>Maybe This Could Work:</strong> They lower their shields.</li>
                            <li><strong>Midpoint:</strong> First kiss or love scene. High point.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 class="text-xl font-bold text-pink-800 border-b border-pink-200 mb-2">Phase 3: Retreating from Love</h2>
                        <ul class="list-disc pl-5 space-y-2 text-gray-700">
                            <li><strong>Inkling of Doubt:</strong> Fear returns. Ghosts haunt them.</li>
                            <li><strong>Deepening Doubt:</strong> Pulling away.</li>
                            <li><strong>The Retreat:</strong> H1 or H2 puts the shield back up.</li>
                            <li><strong>The Break Up:</strong> The relationship ends (The black moment).</li>
                        </ul>
                    </div>

                    <div>
                        <h2 class="text-xl font-bold text-pink-800 border-b border-pink-200 mb-2">Phase 4: Fighting for Love</h2>
                        <ul class="list-disc pl-5 space-y-2 text-gray-700">
                            <li><strong>Dark Night of the Soul:</strong> Miserable without each other.</li>
                            <li><strong>The Wake Up:</strong> Realization that fear < love.</li>
                            <li><strong>Grand Gesture:</strong> Proof of change. Fixing the mistake.</li>
                            <li><strong>Whole Hearted:</strong> Acceptance and union.</li>
                            <li><strong>Epilogue:</strong> Happily Ever After.</li>
                        </ul>
                    </div>
                </div>
            </div>
        `
    },
    // --- NON-FICTION & ACADEMIC ---
    {
        id: 'memoir-structure',
        name: 'Memoir',
        description: 'Guides you through thematic or chronological storytelling for personal history.',
        category: 'Non-Fiction',
        content: `
            <div class="max-w-3xl mx-auto">
                <h1 class="text-3xl font-bold mb-6">Memoir Outline</h1>
                
                <div class="bg-gray-100 p-4 rounded mb-6">
                    <h3 class="font-bold text-lg mb-2">The Theme</h3>
                    <p class="text-gray-600 italic">What is the core message or lesson of your life story? (e.g. Forgiveness, Resilience)</p>
                </div>

                <div class="space-y-6">
                    <div>
                        <h2 class="text-xl font-bold border-b mb-2">Part 1: The "Before"</h2>
                        <p class="mb-2">Establish who you were before the events that changed you.</p>
                        <ul class="list-disc pl-5">
                            <li>Childhood / Background context relevant to theme.</li>
                            <li>The status quo: What did you believe back then?</li>
                            <li>The Inciting Incident: The event that set your journey in motion.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 class="text-xl font-bold border-b mb-2">Part 2: The Struggle (The Middle)</h2>
                        <p class="mb-2">The events that tested you.</p>
                        <ul class="list-disc pl-5">
                            <li><strong>Conflict 1:</strong> Initial challenges.</li>
                            <li><strong>The Valley:</strong> The lowest point or greatest difficulty.</li>
                            <li><strong>Turning Point:</strong> The moment your perspective shifted.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 class="text-xl font-bold border-b mb-2">Part 3: The "After"</h2>
                        <p class="mb-2">Who are you now?</p>
                        <ul class="list-disc pl-5">
                            <li>Resolution of the conflict.</li>
                            <li>Reflection on the journey.</li>
                            <li>Takeaway for the reader.</li>
                        </ul>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: 'biography-structure',
        name: 'Biography',
        description: 'A structured template for documenting another person\'s life.',
        category: 'Non-Fiction',
        content: `
            <div class="max-w-3xl mx-auto">
                <h1 class="text-3xl font-bold mb-2">Biography: [Subject Name]</h1>
                <p class="text-gray-500 mb-8">Vital Statistics: Birth, Death, Key Achievement</p>

                <div class="space-y-8">
                    <section>
                        <h3 class="font-bold text-xl bg-gray-100 p-2">1. Early Life & Origins</h3>
                        <p>Family background, location, childhood influences, education.</p>
                    </section>

                    <section>
                        <h3 class="font-bold text-xl bg-gray-100 p-2">2. Formative Years</h3>
                        <p>Early career, first struggles, key relationships, defining moments that shaped who they became.</p>
                    </section>

                    <section>
                        <h3 class="font-bold text-xl bg-gray-100 p-2">3. The Rise / Major Works</h3>
                        <p>The achievements they are known for. Detailed account of their contribution to their field.</p>
                    </section>

                    <section>
                        <h3 class="font-bold text-xl bg-gray-100 p-2">4. Conflict & Controversy</h3>
                        <p>Personal struggles, public scandals, failures, or opposition they faced.</p>
                    </section>

                    <section>
                        <h3 class="font-bold text-xl bg-gray-100 p-2">5. Later Years</h3>
                        <p>Retirement, later contributions, reflection.</p>
                    </section>

                    <section>
                        <h3 class="font-bold text-xl bg-gray-100 p-2">6. Legacy & Death</h3>
                        <p>Circumstances of death (if applicable). Lasting impact on the world. Bibliography.</p>
                    </section>
                </div>
            </div>
        `
    },
    {
        id: 'self-help-structure',
        name: 'Self-Help Book',
        description: 'Outlines chapters to follow a problem-solution-actionable advice framework.',
        category: 'Non-Fiction',
        content: `
            <div class="max-w-3xl mx-auto">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold">Self-Help Title</h1>
                    <h2 class="text-xl text-gray-500 italic">Subtitle: The Promise to the Reader</h2>
                </div>

                <div class="space-y-6">
                    <div class="border p-4 rounded-lg">
                        <h3 class="font-bold text-lg text-indigo-700">Introduction: The Hook</h3>
                        <ul class="list-disc pl-5 mt-2">
                            <li>Identify the Reader's Pain (Empathy).</li>
                            <li>The Author's Credibility (Why listen to me?).</li>
                            <li>The Promise (What will this book fix?).</li>
                        </ul>
                    </div>

                    <div class="border p-4 rounded-lg">
                        <h3 class="font-bold text-lg text-indigo-700">Part 1: The Problem (Diagnosis)</h3>
                        <p class="text-sm mb-2">Break down why the reader is stuck.</p>
                        <ul class="list-disc pl-5">
                            <li>Myths & Misconceptions.</li>
                            <li>Root causes.</li>
                            <li>Case Study: Someone who struggled.</li>
                        </ul>
                    </div>

                    <div class="border p-4 rounded-lg">
                        <h3 class="font-bold text-lg text-indigo-700">Part 2: The Solution (The Method)</h3>
                        <p class="text-sm mb-2">Your unique framework or steps.</p>
                        <ul class="list-disc pl-5">
                            <li><strong>Step 1:</strong> [Actionable Advice]</li>
                            <li><strong>Step 2:</strong> [Actionable Advice]</li>
                            <li><strong>Step 3:</strong> [Actionable Advice]</li>
                            <li>Exercises / Worksheets at end of chapters.</li>
                        </ul>
                    </div>

                    <div class="border p-4 rounded-lg">
                        <h3 class="font-bold text-lg text-indigo-700">Part 3: Maintenance (The Future)</h3>
                        <ul class="list-disc pl-5">
                            <li>Common pitfalls/relapses.</li>
                            <li>Long-term habits.</li>
                            <li>Conclusion: Inspiring send-off.</li>
                        </ul>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: 'book-proposal',
        name: 'Book Proposal',
        description: 'A professional template for pitching to publishers, including marketing and competition sections.',
        category: 'Business',
        content: `
            <div class="max-w-4xl mx-auto font-serif">
                <h1 class="text-3xl font-bold text-center mb-8 uppercase">Book Proposal</h1>
                
                <div class="mb-6">
                    <h2 class="text-xl font-bold border-b-2 border-black mb-2">Overview</h2>
                    <p class="mb-4"><strong>Title:</strong> [Title]</p>
                    <p class="mb-4"><strong>Logline:</strong> A one-sentence hook.</p>
                    <p class="mb-4"><strong>Brief Summary:</strong> (300-500 words). What is the book about? Why does it need to be written now?</p>
                </div>

                <div class="mb-6">
                    <h2 class="text-xl font-bold border-b-2 border-black mb-2">Target Audience</h2>
                    <p>Who is this book for? Be specific (demographics, psychographics).</p>
                </div>

                <div class="mb-6">
                    <h2 class="text-xl font-bold border-b-2 border-black mb-2">Competitive Analysis</h2>
                    <p>List 3-5 comparable titles published in the last 3 years.</p>
                    <ul class="list-disc pl-5 mt-2">
                        <li><em>Title</em> by Author - How your book is different/better.</li>
                        <li><em>Title</em> by Author - How your book is different/better.</li>
                    </ul>
                </div>

                <div class="mb-6">
                    <h2 class="text-xl font-bold border-b-2 border-black mb-2">About the Author</h2>
                    <p>Your platform, credentials, previous publications, and social media reach.</p>
                </div>

                <div class="mb-6">
                    <h2 class="text-xl font-bold border-b-2 border-black mb-2">Marketing Plan</h2>
                    <p>How will you help sell the book? (Speaking engagements, mailing list, podcasts).</p>
                </div>

                <div class="mb-6">
                    <h2 class="text-xl font-bold border-b-2 border-black mb-2">Chapter Outline</h2>
                    <p>Brief summaries (1 paragraph) of every chapter in the book.</p>
                </div>

                <div class="mb-6">
                    <h2 class="text-xl font-bold border-b-2 border-black mb-2">Sample Chapters</h2>
                    <p>[Insert the first 1-3 chapters of the manuscript here]</p>
                </div>
            </div>
        `
    },
    {
        id: 'phd-thesis',
        name: 'Ph.D. Thesis',
        description: 'A structural guide for academic dissertation formatting.',
        category: 'Academic',
        content: `
            <div class="max-w-4xl mx-auto leading-relaxed">
                <div class="text-center py-12 mb-8">
                    <h1 class="text-2xl font-bold uppercase mb-2">Dissertation Title</h1>
                    <p class="text-lg">A dissertation submitted in partial fulfillment...</p>
                    <p class="text-lg font-bold mt-4">Student Name</p>
                    <p class="text-md">University Name, Year</p>
                </div>

                <div class="page-break"></div>

                <h2 class="text-center font-bold text-xl mb-6">Abstract</h2>
                <p class="mb-8">[Summary of the entire research]</p>

                <h2 class="font-bold text-xl border-b mb-4">Chapter 1: Introduction</h2>
                <ul class="list-disc pl-5 mb-6">
                    <li>Background of the study.</li>
                    <li>Problem Statement.</li>
                    <li>Research Questions / Hypotheses.</li>
                    <li>Significance of the study.</li>
                </ul>

                <h2 class="font-bold text-xl border-b mb-4">Chapter 2: Literature Review</h2>
                <ul class="list-disc pl-5 mb-6">
                    <li>Theoretical Framework.</li>
                    <li>Review of existing research.</li>
                    <li>Identification of gap in literature.</li>
                </ul>

                <h2 class="font-bold text-xl border-b mb-4">Chapter 3: Methodology</h2>
                <ul class="list-disc pl-5 mb-6">
                    <li>Research Design (Qualitative/Quantitative/Mixed).</li>
                    <li>Population and Sampling.</li>
                    <li>Data Collection Instruments.</li>
                    <li>Data Analysis Procedures.</li>
                </ul>

                <h2 class="font-bold text-xl border-b mb-4">Chapter 4: Results</h2>
                <ul class="list-disc pl-5 mb-6">
                    <li>Presentation of data (Tables, Charts).</li>
                    <li>Analysis of findings relative to hypotheses.</li>
                </ul>

                <h2 class="font-bold text-xl border-b mb-4">Chapter 5: Discussion & Conclusion</h2>
                <ul class="list-disc pl-5 mb-6">
                    <li>Interpretation of results.</li>
                    <li>Limitations of the study.</li>
                    <li>Recommendations for future research.</li>
                    <li>Conclusion.</li>
                </ul>

                <h2 class="font-bold text-xl border-b mb-4">References</h2>
                <p>[Bibliography format]</p>
            </div>
        `
    },
    // --- EXISTING ---
    {
      id: 'screenplay-standard',
      name: 'Screenplay (Standard)',
      description: 'Standard industry format for film and television scripts.',
      category: 'Scriptwriting',
      content: `
        <div class="font-mono text-base max-w-3xl mx-auto p-8 leading-tight" style="font-family: 'Courier New', Courier, monospace;">
          <br><br><br>
          <div class="text-center mb-24">
            <h1 class="text-xl underline mb-2 uppercase">TITLE OF SCREENPLAY</h1>
            <p class="text-sm">Written by</p>
            <p class="text-sm">Author Name</p>
          </div>
  
          <div class="mb-6 font-bold uppercase">EXT. LOCATION - DAY</div>
  
          <p class="mb-4">ACTION LINES describe the scene. We see a HERO (30s) standing on the edge of a cliff, looking out at the horizon. The wind howls.</p>
  
          <div class="w-1/2 mx-auto text-center mb-0 mt-6 uppercase">HERO</div>
          <div class="w-2/3 mx-auto text-center mb-1">(breathless)</div>
          <div class="w-3/4 mx-auto text-center mb-4">I made it. I finally made it.</div>
  
          <p class="mb-4">The Hero turns around to face the VILLAIN, who emerges from the shadows.</p>
  
          <div class="w-1/2 mx-auto text-center mb-0 mt-6 uppercase">VILLAIN</div>
          <div class="w-3/4 mx-auto text-center mb-4">You're too late. The timeline has already shifted.</div>
          
          <div class="mb-6 font-bold uppercase mt-8">INT. LAB - NIGHT</div>
          
          <p class="mb-4">The lab is in ruins. Sparks fly from a broken server rack.</p>
        </div>
      `
    },
    {
        id: 'novel-outline',
        name: 'Novel Outline (Basic)',
        description: 'A structured roadmap for plotting your next bestseller.',
        category: 'Fiction',
        content: `
          <div class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold mb-2">Novel Outline</h1>
            <h2 class="text-xl text-gray-600 mb-8 italic">Working Title</h2>
          
            <div class="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mb-6">
              <h3 class="font-bold text-lg mb-2">Logline</h3>
              <p>A one-sentence summary of the story's central conflict. (e.g., "A young hobbit travels to a volcano to destroy a ring.")</p>
            </div>
          
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div class="p-4 bg-gray-50 rounded border border-gray-100">
                <h4 class="font-bold border-b border-gray-300 mb-2 pb-1">Protagonist</h4>
                <p class="mb-1"><strong>Name:</strong> [Name]</p>
                <p class="mb-1"><strong>Goal:</strong> What do they want?</p>
                <p class="mb-1"><strong>Motivation:</strong> Why do they want it?</p>
                <p><strong>Flaw:</strong> What stops them?</p>
              </div>
              <div class="p-4 bg-gray-50 rounded border border-gray-100">
                <h4 class="font-bold border-b border-gray-300 mb-2 pb-1">Antagonist</h4>
                <p class="mb-1"><strong>Name:</strong> [Name]</p>
                <p class="mb-1"><strong>Goal:</strong> What do they want?</p>
                <p><strong>Power:</strong> Why are they a threat?</p>
              </div>
            </div>
          
            <h3 class="text-2xl font-bold mb-4 border-b-2 border-gray-800">Act I: The Setup</h3>
            <ul class="list-none space-y-4">
              <li class="pl-4 border-l-4 border-blue-400 bg-blue-50 p-2 rounded-r"><strong>The Hook:</strong> Opening image/scene.</li>
              <li class="pl-4 border-l-4 border-blue-400 bg-blue-50 p-2 rounded-r"><strong>Inciting Incident:</strong> The event that changes everything.</li>
              <li class="pl-4 border-l-4 border-blue-400 bg-blue-50 p-2 rounded-r"><strong>Plot Point 1:</strong> Protagonist commits to the journey.</li>
            </ul>
          
            <h3 class="text-2xl font-bold mb-4 mt-8 border-b-2 border-gray-800">Act II: The Confrontation</h3>
            <ul class="list-none space-y-4">
              <li class="pl-4 border-l-4 border-purple-400 bg-purple-50 p-2 rounded-r"><strong>Rising Action:</strong> Obstacles and failures.</li>
              <li class="pl-4 border-l-4 border-purple-400 bg-purple-50 p-2 rounded-r"><strong>Midpoint:</strong> A major shift or realization.</li>
              <li class="pl-4 border-l-4 border-purple-400 bg-purple-50 p-2 rounded-r"><strong>All Hope is Lost:</strong> The lowest point.</li>
            </ul>
            
            <h3 class="text-2xl font-bold mb-4 mt-8 border-b-2 border-gray-800">Act III: The Resolution</h3>
            <ul class="list-none space-y-4">
              <li class="pl-4 border-l-4 border-green-400 bg-green-50 p-2 rounded-r"><strong>Climax:</strong> Final battle/confrontation.</li>
              <li class="pl-4 border-l-4 border-green-400 bg-green-50 p-2 rounded-r"><strong>Resolution:</strong> New normal.</li>
            </ul>
          </div>
        `
    },
    {
        id: 'character-profile',
        name: 'Character Profile',
        description: 'Deep dive into character psychology and backstory.',
        category: 'Creative',
        content: `
          <div class="max-w-3xl mx-auto p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div class="flex items-center gap-6 mb-8">
                <div class="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                    Image
                </div>
                <div>
                    <h1 class="text-4xl font-bold text-gray-900 mb-1">Character Name</h1>
                    <p class="text-xl text-gray-500">Role (e.g. Hero, Mentor)</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 class="font-bold text-indigo-600 uppercase text-xs tracking-wider mb-2">Vitals</h3>
                    <ul class="space-y-2 text-sm">
                        <li class="flex justify-between border-b border-gray-100 pb-1"><span>Age:</span> <span class="text-gray-600">--</span></li>
                        <li class="flex justify-between border-b border-gray-100 pb-1"><span>Occupation:</span> <span class="text-gray-600">--</span></li>
                        <li class="flex justify-between border-b border-gray-100 pb-1"><span>Home:</span> <span class="text-gray-600">--</span></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-bold text-indigo-600 uppercase text-xs tracking-wider mb-2">Appearance</h3>
                    <p class="text-sm text-gray-700 leading-relaxed">
                        Height, build, hair color, distinctive features, clothing style.
                    </p>
                </div>
            </div>

            <div class="mb-6">
                <h3 class="font-bold text-lg mb-2">Internal World</h3>
                <div class="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div>
                        <span class="font-bold text-sm block mb-1">Greatest Fear:</span>
                        <p class="text-sm text-gray-700">What keeps them up at night?</p>
                    </div>
                    <div>
                        <span class="font-bold text-sm block mb-1">Core Desire:</span>
                        <p class="text-sm text-gray-700">What drives their every action?</p>
                    </div>
                </div>
            </div>

            <div class="mb-6">
                <h3 class="font-bold text-lg mb-2">Backstory</h3>
                <p class="text-gray-700 leading-relaxed mb-4">
                    Key events from childhood or past that shaped who they are today.
                </p>
            </div>
          </div>
        `
    },
    {
      id: 'academic-research-paper',
      name: 'Research Paper (APA)',
      description: 'Structured academic layout suitable for student papers and journals.',
      category: 'Academic',
      content: `
        <div class="max-w-4xl mx-auto font-serif text-lg leading-loose">
          <div class="text-center mb-24 mt-12">
            <h1 class="text-2xl font-bold mb-4">Full Title of The Research Paper</h1>
            <p class="text-lg mb-1">Student Name</p>
            <p class="text-lg mb-1">Department Name, University Name</p>
            <p class="text-lg mb-1">Course Number: Course Name</p>
            <p class="text-lg mb-1">Instructor Name</p>
            <p class="text-lg">Date</p>
          </div>
  
          <div class="page-break-after"></div>
  
          <h2 class="text-center font-bold text-xl mb-4">Abstract</h2>
          <p class="mb-12 indent-0 text-justify text-base">
            [Abstract goes here. No indentation for the first line of the abstract. Briefly summarize the research question, methods, results, and conclusions. Usually 150-250 words.]
          </p>
  
          <h2 class="font-bold text-xl mb-3 text-center">Title of Paper Again</h2>
          
          <h3 class="font-bold text-lg mb-2">Introduction</h3>
          <p class="mb-6 indent-12 text-justify">
            Provide context and background for the study. State the problem and the research objectives. Use citations for any factual claims.
          </p>
  
          <h3 class="font-bold text-lg mb-2">Literature Review</h3>
          <p class="mb-6 indent-12 text-justify">
            Discuss previous studies and gaps in current knowledge. Group studies by theme rather than listing them chronologically.
          </p>
  
          <h3 class="font-bold text-lg mb-2">Methodology</h3>
          <p class="mb-6 indent-12 text-justify">
            Describe the research design, participants, and procedures used so that the study could be replicated.
          </p>
  
          <h3 class="font-bold text-lg mb-2">Results</h3>
          <p class="mb-6 indent-12 text-justify">
            Present findings with tables or figures if necessary. Do not interpret the results here; just state the facts.
          </p>
  
          <h3 class="font-bold text-lg mb-2">Discussion</h3>
          <p class="mb-6 indent-12 text-justify">
            Interpret the results and their implications. Discuss limitations of the study and suggestions for future research.
          </p>
  
          <div class="mt-12 border-t pt-8">
            <h2 class="text-center font-bold text-lg mb-6">References</h2>
            <div class="pl-8 -indent-8 mb-4">Author, A. A., & Author, B. B. (Year). <em>Title of book</em>. Publisher.</div>
            <div class="pl-8 -indent-8 mb-4">Author, C. C. (Year). Title of article. <em>Title of Periodical</em>, Vol(Issue), pp-pp.</div>
          </div>
        </div>
      `
    },
    {
        id: 'lesson-plan',
        name: 'Lesson Plan',
        description: 'For educators to plan classes with objectives and activities.',
        category: 'Education',
        content: `
            <div class="max-w-4xl mx-auto">
                <div class="border-b-2 border-indigo-600 pb-4 mb-6 flex justify-between items-end">
                    <div>
                        <h1 class="text-3xl font-bold text-indigo-900">Lesson Plan</h1>
                        <p class="text-gray-600">Subject: [Subject] | Grade Level: [Grade]</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold">Date: [Date]</p>
                        <p class="text-gray-500">Duration: [Mins]</p>
                    </div>
                </div>

                <div class="bg-indigo-50 p-4 rounded-lg mb-6">
                    <h3 class="font-bold text-indigo-800 mb-2">🎯 Learning Objectives</h3>
                    <p class="text-sm text-indigo-900 mb-2">By the end of this lesson, students will be able to:</p>
                    <ul class="list-disc pl-5 space-y-1 text-indigo-900">
                        <li>Objective 1</li>
                        <li>Objective 2</li>
                    </ul>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 class="font-bold text-gray-800 border-b border-gray-200 mb-2">Materials Needed</h3>
                        <ul class="list-disc pl-5 text-gray-700 text-sm">
                            <li>Textbook pages...</li>
                            <li>Projector</li>
                            <li>Worksheets</li>
                        </ul>
                    </div>
                     <div>
                        <h3 class="font-bold text-gray-800 border-b border-gray-200 mb-2">Key Vocabulary</h3>
                        <ul class="list-disc pl-5 text-gray-700 text-sm">
                            <li>Term 1</li>
                            <li>Term 2</li>
                        </ul>
                    </div>
                </div>

                <h3 class="font-bold text-xl mb-4 bg-gray-100 p-2 rounded">Lesson Outline</h3>
                
                <div class="space-y-4">
                    <div class="flex gap-4">
                        <div class="w-24 font-bold text-gray-500 shrink-0">0-10 min</div>
                        <div>
                            <h4 class="font-bold text-gray-900">Introduction / Warm-up</h4>
                            <p class="text-gray-700">Hook the students' interest. Review previous lesson.</p>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div class="w-24 font-bold text-gray-500 shrink-0">10-30 min</div>
                        <div>
                            <h4 class="font-bold text-gray-900">Direct Instruction</h4>
                            <p class="text-gray-700">Present new material. Use visual aids.</p>
                        </div>
                    </div>
                     <div class="flex gap-4">
                        <div class="w-24 font-bold text-gray-500 shrink-0">30-50 min</div>
                        <div>
                            <h4 class="font-bold text-gray-900">Guided Practice</h4>
                            <p class="text-gray-700">Activity or worksheet done in pairs/groups.</p>
                        </div>
                    </div>
                     <div class="flex gap-4">
                        <div class="w-24 font-bold text-gray-500 shrink-0">50-60 min</div>
                        <div>
                            <h4 class="font-bold text-gray-900">Assessment / Closure</h4>
                            <p class="text-gray-700">Exit ticket or quick quiz.</p>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    {
      id: 'resume-modern',
      name: 'Modern Resume',
      description: 'A clean, two-column layout for professional CVs.',
      category: 'Personal',
      content: `
        <div class="max-w-4xl mx-auto">
          <header class="border-b-2 border-gray-800 pb-4 mb-6">
            <h1 class="text-4xl font-bold text-gray-900 uppercase tracking-wider">Your Name</h1>
            <p class="text-xl text-gray-600 mt-2">Professional Title / Role</p>
            <div class="flex gap-4 text-sm text-gray-500 mt-2">
              <span>📍 City, Country</span>
              <span>📧 email@example.com</span>
              <span>🔗 linkedin.com/in/yourname</span>
            </div>
          </header>
  
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <aside class="col-span-1 space-y-6">
              <section>
                <h3 class="text-lg font-bold uppercase border-b border-gray-300 mb-2">Skills</h3>
                <ul class="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Skill 1</li>
                  <li>Skill 2</li>
                  <li>Skill 3</li>
                  <li>Skill 4</li>
                </ul>
              </section>
  
              <section>
                <h3 class="text-lg font-bold uppercase border-b border-gray-300 mb-2">Education</h3>
                <div class="mb-2">
                  <p class="font-bold text-sm">Degree Name</p>
                  <p class="text-xs text-gray-600">University Name</p>
                  <p class="text-xs text-gray-500">2018 - 2022</p>
                </div>
              </section>
  
              <section>
                <h3 class="text-lg font-bold uppercase border-b border-gray-300 mb-2">Languages</h3>
                <p class="text-sm">English (Native)</p>
                <p class="text-sm">Spanish (Intermediate)</p>
              </section>
            </aside>
  
            <main class="col-span-2 space-y-6">
              <section>
                <h3 class="text-lg font-bold uppercase border-b border-gray-300 mb-3">Profile</h3>
                <p class="text-gray-700 leading-relaxed">
                  A brief professional summary about yourself, your career goals, and what you bring to the table. Keep it concise and impactful.
                </p>
              </section>
  
              <section>
                <h3 class="text-lg font-bold uppercase border-b border-gray-300 mb-3">Experience</h3>
                
                <div class="mb-4">
                  <div class="flex justify-between items-baseline">
                    <h4 class="font-bold text-lg">Senior Job Title</h4>
                    <span class="text-sm text-gray-500">2021 - Present</span>
                  </div>
                  <p class="text-indigo-700 font-medium text-sm mb-2">Company Name</p>
                  <ul class="list-disc pl-5 text-gray-700 space-y-1">
                    <li>Spearheaded a key project that resulted in 20% growth.</li>
                    <li>Managed a team of 5 designers and developers.</li>
                    <li>Implemented new strategies for workflow efficiency.</li>
                  </ul>
                </div>
  
                <div class="mb-4">
                  <div class="flex justify-between items-baseline">
                    <h4 class="font-bold text-lg">Junior Job Title</h4>
                    <span class="text-sm text-gray-500">2019 - 2021</span>
                  </div>
                  <p class="text-indigo-700 font-medium text-sm mb-2">Previous Company</p>
                  <ul class="list-disc pl-5 text-gray-700 space-y-1">
                    <li>Assisted in daily operations and client communications.</li>
                    <li>Developed internal tools using JavaScript.</li>
                  </ul>
                </div>
              </section>
            </main>
          </div>
        </div>
      `
    },
    {
      id: 'meeting-notes',
      name: 'Meeting Minutes',
      description: 'Structured layout for tracking agenda, attendees, and action items.',
      category: 'Business',
      content: `
        <div class="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">Meeting Minutes</h1>
          
          <table class="w-full mb-6 text-sm border-collapse">
            <tr>
              <td class="font-bold p-2 border-b border-gray-300 w-32">Date:</td>
              <td class="p-2 border-b border-gray-300">${new Date().toLocaleDateString()}</td>
              <td class="font-bold p-2 border-b border-gray-300 w-32">Time:</td>
              <td class="p-2 border-b border-gray-300">10:00 AM</td>
            </tr>
            <tr>
              <td class="font-bold p-2 border-b border-gray-300">Facilitator:</td>
              <td class="p-2 border-b border-gray-300">[Name]</td>
              <td class="font-bold p-2 border-b border-gray-300">Location:</td>
              <td class="p-2 border-b border-gray-300">Conference Room A / Zoom</td>
            </tr>
          </table>
  
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-indigo-700 bg-indigo-50 p-2 rounded mb-2">👥 Attendees</h3>
            <p class="text-gray-700">Present: [List names here]</p>
            <p class="text-gray-500 text-sm">Apologies: [List names here]</p>
          </div>
  
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-indigo-700 bg-indigo-50 p-2 rounded mb-2">📅 Agenda</h3>
            <ol class="list-decimal pl-5 space-y-2">
              <li><strong>Review previous minutes</strong> (5 min)</li>
              <li><strong>Project Status Update</strong> (15 min)</li>
              <li><strong>Roadblock Discussion</strong> (20 min)</li>
              <li><strong>Next Steps</strong> (10 min)</li>
            </ol>
          </div>
  
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-indigo-700 bg-indigo-50 p-2 rounded mb-2">📝 Discussion Notes</h3>
            <p class="mb-2">Enter detailed notes here...</p>
            <ul class="list-disc pl-5 space-y-1">
              <li>Key point 1</li>
              <li>Key point 2</li>
            </ul>
          </div>
  
          <div>
            <h3 class="text-lg font-semibold text-indigo-700 bg-indigo-50 p-2 rounded mb-2">✅ Action Items</h3>
            <ul class="space-y-2">
              <li class="flex items-center gap-2">
                <input type="checkbox"> <span><strong>[Owner]</strong> Task description by [Date]</span>
              </li>
              <li class="flex items-center gap-2">
                <input type="checkbox"> <span><strong>[Owner]</strong> Task description by [Date]</span>
              </li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: 'newsletter',
      name: 'Newsletter Issue',
      description: 'A stylish layout for community updates or weekly digests.',
      category: 'Creative',
      content: `
        <div class="max-w-3xl mx-auto">
          <div class="bg-indigo-900 text-white p-8 rounded-t-xl text-center">
            <p class="uppercase tracking-widest text-xs font-semibold text-indigo-200 mb-2">Weekly Issue #42</p>
            <h1 class="text-4xl font-serif font-bold mb-2">The Nebula Digest</h1>
            <p class="text-indigo-100 italic">Curated insights for creative minds.</p>
          </div>
  
          <div class="bg-white p-8 border-x border-b border-gray-200 shadow-sm rounded-b-xl">
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-800 mb-3">🚀 Feature Story: The Future of Docs</h2>
              <img src="https://images.unsplash.com/photo-1499750310159-525446cc0d27?q=80&w=2070&auto=format&fit=crop" class="w-full h-48 object-cover rounded-lg mb-4 opacity-80" alt="Workspace">
              <p class="text-gray-700 leading-relaxed mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <a href="#" class="text-indigo-600 font-medium hover:underline">Read the full story &rarr;</a>
            </div>
  
            <hr class="border-gray-200 my-8">
  
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h3 class="font-bold text-lg mb-2">💡 Quick Tips</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• Use shortcuts to speed up workflow.</li>
                  <li>• Organize folders by project.</li>
                  <li>• Collaborate in real-time.</li>
                </ul>
              </div>
              <div>
                <h3 class="font-bold text-lg mb-2">🔗 Links we Love</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li><a href="#" class="text-blue-600 hover:underline">Design Trends 2024</a></li>
                  <li><a href="#" class="text-blue-600 hover:underline">Productivity Hacks</a></li>
                  <li><a href="#" class="text-blue-600 hover:underline">Remote Work Guide</a></li>
                </ul>
              </div>
            </div>
  
            <div class="mt-12 text-center text-xs text-gray-400">
              <p>Sent with ❤️ by Nebula Docs</p>
              <p>123 Innovation Dr, Tech City</p>
              <a href="#" class="underline">Unsubscribe</a>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'project-proposal',
      name: 'Project Proposal',
      description: 'Formal document structure for pitching projects.',
      category: 'Business',
      content: `
        <div class="space-y-6">
          <div class="text-center border-b-2 border-gray-900 pb-6">
            <h1 class="text-4xl font-bold">Project Proposal</h1>
            <h2 class="text-2xl text-gray-600 mt-2">Project Name: [Insert Name]</h2>
            <p class="text-gray-500 mt-4">Prepared for: [Client Name] | Date: [Date]</p>
          </div>
  
          <div class="bg-gray-50 p-6 rounded-lg">
            <h3 class="text-xl font-bold text-gray-900 mb-2">1. Executive Summary</h3>
            <p class="text-gray-700">
              Briefly describe the project, the problem it solves, and the expected outcome. This section should be concise and compelling.
            </p>
          </div>
  
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">2. Objectives</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 border border-gray-200 rounded shadow-sm">
                <div class="text-2xl mb-2">🎯</div>
                <h4 class="font-bold">Goal 1</h4>
                <p class="text-sm text-gray-600">Specific, measurable objective.</p>
              </div>
              <div class="p-4 border border-gray-200 rounded shadow-sm">
                <div class="text-2xl mb-2">📈</div>
                <h4 class="font-bold">Goal 2</h4>
                <p class="text-sm text-gray-600">Growth or efficiency target.</p>
              </div>
              <div class="p-4 border border-gray-200 rounded shadow-sm">
                <div class="text-2xl mb-2">⚡</div>
                <h4 class="font-bold">Goal 3</h4>
                <p class="text-sm text-gray-600">Implementation speed or quality.</p>
              </div>
            </div>
          </div>
  
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">3. Timeline & Deliverables</h3>
            <table class="w-full border-collapse border border-gray-300">
              <thead class="bg-gray-100">
                <tr>
                  <th class="border border-gray-300 p-2 text-left">Phase</th>
                  <th class="border border-gray-300 p-2 text-left">Deliverable</th>
                  <th class="border border-gray-300 p-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="border border-gray-300 p-2">Phase 1: Discovery</td>
                  <td class="border border-gray-300 p-2">Research Report</td>
                  <td class="border border-gray-300 p-2">2 Weeks</td>
                </tr>
                <tr>
                  <td class="border border-gray-300 p-2">Phase 2: Development</td>
                  <td class="border border-gray-300 p-2">Prototype</td>
                  <td class="border border-gray-300 p-2">4 Weeks</td>
                </tr>
                 <tr>
                  <td class="border border-gray-300 p-2">Phase 3: Launch</td>
                  <td class="border border-gray-300 p-2">Final Product</td>
                  <td class="border border-gray-300 p-2">1 Week</td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-2 border-l-4 border-blue-600 pl-3">4. Budget Estimate</h3>
            <p class="text-gray-700">Total estimated cost: <strong>$XX,XXX</strong>. Payment terms are net-30.</p>
          </div>
        </div>
      `
    }
  ];
