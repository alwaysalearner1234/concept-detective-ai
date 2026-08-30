"""
Demo/mock content used when no ANTHROPIC_API_KEY is configured.

IMPORTANT AI-DESIGN NOTE:
Every stage below is built around *applying* a concept, not recalling a
fact. The `accepted` keywords represent the reasoning path a student who
understands the concept would express, and `misconceptions` maps common
WRONG answers to the specific misunderstanding behind them (this is the
same shape the live LLM is prompted to produce in app/ai_service.py).
"""
from typing import Any, Dict, List

# Each topic -> full mock case template.
MOCK_CASES: Dict[str, Dict[str, Any]] = {
    "electricity": {
        "title": "The Case of the Flickering Lab",
        "setting": "Maple Street Robotics Lab, 9:47 PM",
        "briefing": (
            "The robotics lab's demo circuit died minutes before tomorrow's science fair. "
            "Three students had access tonight. You must use circuit evidence -- not alibis -- "
            "to figure out what actually happened to the current."
        ),
        "suspects": ["Priya (added a second motor)", "Sam (swapped the battery)", "Dev (rewired the switch)"],
        "clues": [
            {"id": "c1", "title": "Multimeter Reading", "content": "Voltage across the battery reads 9V, but voltage across the motor reads only 2V.",
             "concept_link": "A large voltage drop elsewhere means something is consuming most of the energy before it reaches the motor."},
            {"id": "c2", "title": "Component Log", "content": "Priya added a second motor in SERIES with the first one earlier tonight.",
             "concept_link": "In a series circuit, the same current flows through every component, and total resistance adds up."},
            {"id": "c3", "title": "Burn Mark", "content": "A resistor near the switch is warm to the touch and slightly discolored.",
             "concept_link": "Excess current through a resistor generates heat (P = I^2R)."},
        ],
        "stages": [
            {
                "id": "q1",
                "prompt": "The motor is getting far less voltage than the battery supplies. Based on the multimeter reading and component log, what's the most likely reason?",
                "accepted": ["series", "second motor", "resistance", "shared", "split", "divide"],
                "misconceptions": {
                    "battery": "The student assumes the battery itself is broken/weak, ignoring that the circuit's *arrangement* (series vs parallel) changes how voltage is distributed.",
                    "broken": "The student jumps to 'something is broken' instead of reasoning about how series circuits divide voltage across components.",
                },
                "hint": "Think about what happens to voltage when you add a second component in the SAME loop as the first, instead of a separate loop.",
                "concept_reinforcement": "In series circuits, voltage divides across components proportional to their resistance -- adding a second motor in series means each motor gets only part of the battery's voltage.",
            },
            {
                "id": "q2",
                "prompt": "If Priya wants both motors to get the full 9V like before, how should she reconnect them?",
                "accepted": ["parallel", "separate loop", "separate branch"],
                "misconceptions": {
                    "bigger battery": "The student tries to fix a wiring/topology problem by increasing power supply, rather than changing the circuit structure.",
                    "thicker wire": "The student confuses resistance-from-wire-gauge with resistance-from-circuit-arrangement.",
                },
                "hint": "Consider connecting each motor on its own separate branch, so each branch sees the same voltage independently.",
                "concept_reinforcement": "Wiring components in parallel means each branch experiences the full source voltage, unlike series where voltage is shared.",
            },
            {
                "id": "q3",
                "prompt": "The warm resistor near the switch -- what does that heat most likely tell you happened right before the failure?",
                "accepted": ["too much current", "overcurrent", "short", "excess current", "high current"],
                "misconceptions": {
                    "cold": "The student misreads a thermal clue as irrelevant rather than connecting heat to current flow (P = I^2R).",
                    "voltage": "The student attributes the heating to voltage alone, missing that resistive heating depends on current squared.",
                },
                "hint": "Recall the relationship between current, resistance, and heat dissipated in a resistor.",
                "concept_reinforcement": "Power dissipated as heat in a resistor follows P = I^2R -- a spike in current causes a disproportionate rise in heat, which explains the burn mark.",
            },
        ],
        "culprit": "Dev's rewiring pushed extra current through the switch resistor right as Priya's series motor addition unbalanced the circuit -- together they overloaded it and killed the demo.",
    },
    "newtons_laws": {
        "title": "The Runaway Cargo Cart Mystery",
        "setting": "Warehouse Loading Dock, Bay 4",
        "briefing": (
            "A loaded cargo cart rolled through a safety barrier with no one pushing it. "
            "Security footage is grainy. You must reconstruct what forces were acting on the cart "
            "using physics, not guesswork."
        ),
        "suspects": ["A tilted ramp", "A gust of wind", "A worker's shove caught off-camera"],
        "clues": [
            {"id": "c1", "title": "Ramp Angle", "content": "The loading ramp the cart was parked on has a slight 6-degree incline.",
             "concept_link": "Gravity has a component along an inclined surface, even a small one."},
            {"id": "c2", "title": "Wheel Lock", "content": "The cart's wheel brake was found in the 'unlocked' position.",
             "concept_link": "An unlocked wheel means friction was low enough to not resist the incline's pull."},
            {"id": "c3", "title": "Final Speed", "content": "The cart hit the barrier at a speed higher than a light gust could plausibly cause over that short distance.",
             "concept_link": "Constant unbalanced force over distance/time produces acceleration, not just a single push."},
        ],
        "stages": [
            {
                "id": "q1",
                "prompt": "The cart was on a 6-degree ramp with its brake unlocked and no one touching it. What's the most likely reason it started moving?",
                "accepted": ["gravity", "component of gravity", "incline", "unbalanced force", "net force"],
                "misconceptions": {
                    "wind": "The student defaults to an external force (wind) instead of recognizing gravity's component along an incline as an unbalanced force.",
                    "nothing": "The student assumes objects need a continuous push from a person, missing Newton's First Law: an object at rest stays at rest only if NET force is zero.",
                },
                "hint": "An object doesn't need a person pushing it to accelerate -- what force acts on every object near Earth's surface, even ones sitting still?",
                "concept_reinforcement": "Newton's First Law: an object stays at rest only when the net force on it is zero. On an incline, gravity has a component along the slope, so an unlocked cart is NOT in equilibrium.",
            },
            {
                "id": "q2",
                "prompt": "The cart was fully loaded (heavier) versus empty. Does a heavier cart accelerate faster, slower, or the same down this ramp (ignoring friction)?",
                "accepted": ["same", "equal", "independent of mass", "cancels out"],
                "misconceptions": {
                    "faster": "The student assumes heavier objects always accelerate faster, a classic pre-Newtonian misconception (confusing force with acceleration).",
                    "slower": "The student assumes mass alone slows acceleration without considering that gravitational force also scales with mass, so they cancel.",
                },
                "hint": "Write out F = ma for gravity's component along the ramp -- what happens to mass when you solve for acceleration?",
                "concept_reinforcement": "Newton's Second Law: a = F/m. Since gravity's pull (F) also scales with mass, mass cancels out -- heavier and lighter carts accelerate the same on a frictionless incline.",
            },
            {
                "id": "q3",
                "prompt": "When the cart finally slammed into the barrier and stopped abruptly, the barrier bent outward. Which law explains why the barrier felt a force too, not just the cart?",
                "accepted": ["third", "action reaction", "equal and opposite"],
                "misconceptions": {
                    "first": "The student confuses inertia (staying at constant velocity) with the interaction-pair nature of collision forces.",
                    "second": "The student focuses on F=ma for the cart's deceleration but misses that the *pair* of forces is what Newton's Third Law describes.",
                },
                "hint": "Think about what happens to the *barrier*, not just the cart, at the moment of impact.",
                "concept_reinforcement": "Newton's Third Law: for every action there is an equal and opposite reaction -- the cart pushed on the barrier exactly as hard as the barrier pushed back on the cart.",
            },
        ],
        "culprit": "No person was involved -- gravity's component along the unlocked, tilted ramp accelerated the cart on its own, consistent with Newton's Laws.",
    },
    "photosynthesis": {
        "title": "The Wilting Greenhouse Case",
        "setting": "Riverside School Greenhouse, Row 3",
        "briefing": (
            "Row 3's plants are pale and stunted while every other row thrives under identical watering. "
            "Something about their environment is starving them of the raw materials for photosynthesis."
        ),
        "suspects": ["A shaded corner blocking light", "Painted-over vents blocking airflow", "Over-watered soil"],
        "clues": [
            {"id": "c1", "title": "Light Log", "content": "Row 3 sits under a section of roof recently painted with a thick opaque sealant.",
             "concept_link": "Photosynthesis requires light energy to drive the light-dependent reactions."},
            {"id": "c2", "title": "Vent Inspection", "content": "The vents near Row 3 were painted shut during recent maintenance.",
             "concept_link": "Photosynthesis consumes CO2 -- without airflow, CO2 near the leaves can become depleted."},
            {"id": "c3", "title": "Leaf Color", "content": "Row 3 leaves are pale green/yellow rather than deep green.",
             "concept_link": "Chlorophyll production and its use in capturing light both depend on adequate light exposure."},
        ],
        "stages": [
            {
                "id": "q1",
                "prompt": "Row 3 sits under a section of roof painted with opaque sealant. What raw material for photosynthesis is this most directly cutting off?",
                "accepted": ["light", "sunlight", "light energy"],
                "misconceptions": {
                    "water": "The student defaults to water as the universal plant-health explanation without connecting the specific clue (blocked light) to its specific role.",
                    "co2": "The student picks a real photosynthesis input but ignores the clue that specifically points to blocked light, not blocked air.",
                },
                "hint": "What does an opaque roof section specifically block that plants need to drive the light-dependent reactions?",
                "concept_reinforcement": "Photosynthesis needs light energy to excite electrons in chlorophyll, kicking off the light-dependent reactions that ultimately produce sugar.",
            },
            {
                "id": "q2",
                "prompt": "The vents near Row 3 are also painted shut. Even if some light gets through, why would poor airflow still stunt these plants?",
                "accepted": ["co2", "carbon dioxide", "gas exchange"],
                "misconceptions": {
                    "oxygen": "The student confuses what plants consume during photosynthesis (CO2) with what they consume during respiration (O2).",
                    "humidity": "The student attributes the airflow problem to moisture rather than to gas exchange needed for photosynthesis's carbon input.",
                },
                "hint": "Photosynthesis doesn't just need light -- what gas from the air is a required raw ingredient in the equation?",
                "concept_reinforcement": "The overall photosynthesis equation is 6CO2 + 6H2O + light -> C6H12O6 + 6O2. Poor airflow limits CO2 available at the leaf surface, directly limiting sugar production.",
            },
            {
                "id": "q3",
                "prompt": "Row 3's leaves are pale yellow-green instead of deep green. What does that color tell you about what's happening inside the leaf cells?",
                "accepted": ["less chlorophyll", "chlorophyll", "pigment"],
                "misconceptions": {
                    "dying roots": "The student jumps to an unrelated organ (roots) instead of connecting leaf color directly to chlorophyll/pigment levels.",
                    "old age": "The student attributes color change to a generic 'aging' explanation instead of the light-dependent process of chlorophyll production.",
                },
                "hint": "Leaf color comes from a specific pigment involved in capturing light -- what happens to that pigment when light is scarce?",
                "concept_reinforcement": "Chlorophyll (the green pigment) both captures light and is produced in response to light exposure -- low light leads to less chlorophyll and paler leaves.",
            },
        ],
        "culprit": "The sealed roof and painted-shut vents cut off both light and CO2 -- Row 3 was starved of the two raw materials photosynthesis needs most.",
    },
    "algebra": {
        "title": "The Mismatched Ledger Mystery",
        "setting": "Downtown Bakery, Back Office",
        "briefing": (
            "The bakery's weekly ledger doesn't balance -- the numbers the owner wrote down imply an impossible "
            "price. You must set up and solve the equations correctly to find where the arithmetic went wrong."
        ),
        "suspects": ["A misapplied discount", "A doubled ingredient cost", "A typo in the equation itself"],
        "clues": [
            {"id": "c1", "title": "Receipt Note", "content": "'3 cakes plus a $12 delivery fee cost $57 total.' The owner wrote: 3x + 12 = 57.",
             "concept_link": "Translating a word problem into an equation requires matching each phrase to an operation."},
            {"id": "c2", "title": "Owner's Work", "content": "The owner's next line reads: 3x = 57 + 12, giving x = 23.",
             "concept_link": "Solving an equation requires performing the SAME operation to both sides to keep it balanced."},
            {"id": "c3", "title": "Sanity Check", "content": "Plugging x = 23 back in gives 3(23)+12 = 81, not 57.",
             "concept_link": "Checking a solution by substitution reveals whether an algebraic step was valid."},
        ],
        "stages": [
            {
                "id": "q1",
                "prompt": "Look at the owner's step: from 3x + 12 = 57 they wrote 3x = 57 + 12. What did they do wrong?",
                "accepted": ["added instead of subtracted", "should subtract", "sign error", "wrong operation"],
                "misconceptions": {
                    "nothing": "The student doesn't check that moving a term across the equals sign requires flipping its sign (subtracting, not adding).",
                    "multiplication": "The student focuses on the coefficient 3 instead of the additive term 12, missing where the actual error occurred.",
                },
                "hint": "To move '+12' to the other side of the equation, what operation undoes addition?",
                "concept_reinforcement": "To isolate the variable term, you must apply the INVERSE operation to both sides: since +12 was added, you must subtract 12 from both sides, giving 3x = 57 - 12.",
            },
            {
                "id": "q2",
                "prompt": "Using the corrected equation 3x = 57 - 12, what is the correct value of x?",
                "accepted": ["15", "x=15", "x = 15"],
                "misconceptions": {
                    "23": "The student is still carrying forward the earlier sign error rather than recomputing from the corrected equation.",
                    "13": "The student made an arithmetic slip in the subtraction (57-12) or the following division step.",
                },
                "hint": "First simplify 57 - 12, then divide both sides by 3.",
                "concept_reinforcement": "3x = 45, so dividing both sides by 3 gives x = 15 -- always fully simplify one side before dividing to isolate the variable.",
            },
            {
                "id": "q3",
                "prompt": "How could the bakery owner verify x = 15 is correct without redoing all the algebra from scratch?",
                "accepted": ["substitute", "plug in", "check by substitution", "plug back in"],
                "misconceptions": {
                    "redo": "The student doesn't yet trust substitution as an independent verification method and insists on repeating the same steps, which wouldn't catch a repeated error.",
                },
                "hint": "Is there a way to plug your answer back into the ORIGINAL equation to see if both sides match?",
                "concept_reinforcement": "Substituting x=15 into 3x+12 gives 3(15)+12 = 57, which matches the original total -- substitution checks are the fastest way to catch algebra mistakes.",
            },
        ],
        "culprit": "The owner made a sign error moving the constant term, inflating the price per cake -- the ledger was never actually unbalanced, the algebra was.",
    },
    "fractions": {
        "title": "The Recipe Ratio Caper",
        "setting": "Community Kitchen, Table 2",
        "briefing": (
            "Two teams doubled a recipe for the school bake sale, but their batches taste completely different. "
            "You must trace exactly how each team scaled their fractions to find who broke the ratio."
        ),
        "suspects": ["Team A (added fractions incorrectly)", "Team B (used the wrong common denominator)", "A mislabeled measuring cup"],
        "clues": [
            {"id": "c1", "title": "Team A's Note", "content": "Original recipe needs 1/2 cup sugar + 1/3 cup honey. Team A wrote: 1/2 + 1/3 = 2/5.",
             "concept_link": "Adding fractions requires a common denominator, not adding numerators and denominators separately."},
            {"id": "c2", "title": "Team B's Note", "content": "Team B doubled 3/4 cup flour and wrote the result as 3/8 cup.",
             "concept_link": "Doubling a fraction means multiplying by 2/1, which should INCREASE the amount."},
            {"id": "c3", "title": "Taste Test", "content": "Team A's batch was noticeably under-sweetened; Team B's batch used far less flour than needed.",
             "concept_link": "Both errors are consistent with fraction arithmetic mistakes producing smaller-than-expected results."},
        ],
        "stages": [
            {
                "id": "q1",
                "prompt": "Team A added 1/2 + 1/3 and got 2/5. What's the actual correct sum, and what did they do wrong?",
                "accepted": ["5/6", "common denominator", "5/6 common denominator"],
                "misconceptions": {
                    "2/5": "The student adds numerators and denominators straight across, a common but invalid shortcut that ignores what a denominator represents.",
                },
                "hint": "Before adding fractions, what do both denominators need to become?",
                "concept_reinforcement": "To add fractions you must first find a common denominator: 1/2 = 3/6 and 1/3 = 2/6, so 1/2 + 1/3 = 3/6 + 2/6 = 5/6, not 2/5.",
            },
            {
                "id": "q2",
                "prompt": "Team B doubled 3/4 cup and got 3/8 cup. Is that more or less than the original amount, and is that even possible when doubling?",
                "accepted": ["less", "impossible", "should be more", "3/2"],
                "misconceptions": {
                    "correct": "The student doesn't yet check whether doubling should increase or decrease a quantity, missing an easy sanity check.",
                },
                "hint": "Doubling means multiplying by 2. Did Team B multiply, or did they do something else to the denominator?",
                "concept_reinforcement": "Doubling 3/4 means 3/4 x 2 = 6/4 = 3/2 -- Team B instead divided the denominator by 2, which HALVES the value instead of doubling it.",
            },
            {
                "id": "q3",
                "prompt": "What single check could both teams have used to catch their mistakes before baking?",
                "accepted": ["estimate", "reasonableness check", "compare to original", "sanity check"],
                "misconceptions": {
                    "nothing": "The student assumes fraction arithmetic errors are only catchable by redoing the exact same steps, rather than using estimation as an independent check.",
                },
                "hint": "Without doing exact math, could you estimate whether the answer should be bigger or smaller than the starting amount?",
                "concept_reinforcement": "A quick reasonableness check -- 'doubling should roughly double the amount' or 'adding two positive fractions should give something bigger than either one' -- catches most fraction arithmetic slips instantly.",
            },
        ],
        "culprit": "Team A added fractions without a common denominator, and Team B accidentally halved instead of doubled -- two separate, catchable fraction errors.",
    },
}


def get_case_template(topic: str) -> Dict[str, Any]:
    return MOCK_CASES[topic]
