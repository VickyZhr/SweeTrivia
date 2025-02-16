import curses
import random
import time

# Define questions and answers
QUESTIONS = [
    ("What animal has the highest blood pressure?", {"A": "Giraffe", "B": "Dog", "C": "Elephant", "D": "Cheetah"}, "A"),
    ("How many legs does a spider have?", {"A": "2", "B": "4", "C": "6", "D": "8"}, "D"),
    ("How old was Harry Potter when he entered Hogwarts?", {"A": "11", "B": "13", "C": "15", "D": "8"}, "A"),
    ("What country invented hot dogs?", {"A": "Italy", "B": "England", "C": "Germany", "D": "Spain"}, "C"),
    ("What is the main color of the Smurfs?", {"A": "Yellow", "B": "Red", "C": "Green", "D": "Blue"}, "D"),
    ("Which K-pop group released the song Dynamite?", {"A": "EXO", "B": "BTS", "C": "Seventeen", "D": "BLACKPINK"}, "B"),
    ("How old did Queen Elizabeth II live to be?", {"A": "108", "B": "99", "C": "96", "D": "87"}, "C")
]

def ask_question(win, used_questions):
    """Selects a new question without repetition within a round."""
    available_questions = [q for q in QUESTIONS if q[0] not in used_questions]
    
    if not available_questions:  # Reset if all questions have been used
        used_questions.clear()
        available_questions = QUESTIONS.copy()
    
    question, options, correct_answer = random.choice(available_questions)
    used_questions.add(question)  # Store only the question text
    
    win.addstr(4, 2, question, curses.color_pair(1) | curses.A_BOLD)  # Bold question
    for i, (key, value) in enumerate(options.items(), start=6):
        win.addstr(i, 4, f"  {key}. {value}", curses.color_pair(1) | curses.A_BOLD)  # Normal color for choices
    
    return question, options, correct_answer

def game_loop(stdscr):
    """Main game logic using curses."""
    curses.start_color()  # Enable color support

    # Define colors
    curses.init_pair(1, curses.COLOR_BLACK, curses.COLOR_WHITE)  # Default: Black text, White background
    curses.init_pair(2, curses.COLOR_GREEN, curses.COLOR_WHITE)  # Green for correct answers
    curses.init_pair(3, curses.COLOR_RED, curses.COLOR_WHITE)  # Red for incorrect messages
    stdscr.bkgd(curses.color_pair(1))  # Set background color
    stdscr.clear()
    
    curses.curs_set(0)  # Hide cursor
    stdscr.nodelay(True)  # Non-blocking input
    stdscr.timeout(100)  # Refresh rate

    while True:
        stdscr.clear()
        stdscr.addstr(2, 2, "Ready to start the game? Press any key to begin (or 'q' to quit)...", curses.color_pair(1) | curses.A_BOLD)
        stdscr.refresh()
        
        key = stdscr.getch()
        if key == ord('q'):  # Quit if 'q' is pressed
            return
        if key != -1:  # If any other key is pressed, start game
            break

    score = 0
    start_time = time.time()
    used_questions = set()  # Track used question texts for this round

    while True:
        stdscr.clear()
        elapsed_time = time.time() - start_time
        time_left = max(10 - int(elapsed_time), 0)  # Ensure time_left doesn't go negative
        
        # Display time left at top-left (updates live)
        stdscr.addstr(1, 2, " " * 15)  # Clear previous time text
        stdscr.addstr(1, 2, f"Time Left: {time_left}s", curses.color_pair(1) | curses.A_BOLD)
        # Display score at top-right
        stdscr.addstr(1, 50, f"Score: {score}", curses.color_pair(1) | curses.A_BOLD)

        if time_left == 0:  # Check if time is up
            break  # Exit the game loop

        question, options, correct_answer = ask_question(stdscr, used_questions)
        stdscr.refresh()

        user_input = None

        while time.time() - start_time < 10:  # Keep waiting for input until time runs out
            key = stdscr.getch()
            if key == ord('q'):  # Quit if 'q' is pressed at any point
                return
            if key != -1:
                user_input = chr(key).upper()
                break  # Exit input loop

            # Continuously update time display while waiting
            elapsed_time = time.time() - start_time
            time_left = max(10 - int(elapsed_time), 0)
            stdscr.addstr(1, 2, " " * 15)  # Clear previous time text
            stdscr.addstr(1, 2, f"Time Left: {time_left}s", curses.color_pair(1) | curses.A_BOLD)  # Correct format
            stdscr.refresh()
            time.sleep(0.1)  # Refresh every 0.1s

            if time_left == 0:
                break  # Stop waiting when time runs out
        
        if time_left == 0:
            break  # If time is up, exit the game loop

        if user_input == correct_answer:
            score += 10
            stdscr.addstr(10, 4, f"Correct! You chose: {user_input}", curses.color_pair(2) | curses.A_BOLD)  # Green for correct answer
        else:
            stdscr.addstr(10, 4, f"Incorrect! You chose: {user_input}", curses.color_pair(3) | curses.A_BOLD)  # Red for incorrect answer

            # Re-display all choices but **highlight the correct answer**
            for i, (key, value) in enumerate(options.items(), start=6):
                if key == correct_answer:
                    stdscr.addstr(i, 4, f"  {key}. {value}", curses.color_pair(2) | curses.A_BOLD)  # Green highlight
                else:
                    stdscr.addstr(i, 4, f"  {key}. {value}", curses.color_pair(1) | curses.A_BOLD)  # Normal color

        stdscr.refresh()
        time.sleep(1.5)  # Short delay before next question

    # Game over screen
    stdscr.clear()
    stdscr.addstr(5, 10, f"Game over! Your score is: {score}", curses.color_pair(1) | curses.A_BOLD)
    stdscr.refresh()
    time.sleep(3)  # Show score before resetting

    game_loop(stdscr)  # Restart game automatically

# Run the game
if __name__ == "__main__":
    try:
        curses.wrapper(game_loop)
    except KeyboardInterrupt:
        pass  # Allow clean exit with Ctrl+C
