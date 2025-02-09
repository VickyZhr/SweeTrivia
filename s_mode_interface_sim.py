import curses
import random
import time

# Define questions and answers
QUESTIONS = [
    ("What is the answer to 1+1?", {"A": "1", "B": "2", "C": "3", "D": "4"}, "B"),
    ("What is the color of broccoli?", {"A": "red", "B": "blue", "C": "green", "D": "black"}, "C"),
]

def ask_question(win):
    """Randomly selects a question and displays it."""
    question, options, correct_answer = random.choice(QUESTIONS)
    
    win.addstr(4, 2, question, curses.color_pair(1))
    for i, (key, value) in enumerate(options.items(), start=6):
        win.addstr(i, 4, f"  {key}. {value}", curses.color_pair(1))
    
    return correct_answer

def game_loop(stdscr):
    """Main game logic using curses."""
    curses.start_color()  # Enable color support
    curses.init_pair(1, curses.COLOR_BLACK, curses.COLOR_WHITE)  # Black text, White background
    stdscr.bkgd(curses.color_pair(1))  # Apply background color
    stdscr.clear()
    
    curses.curs_set(0)  # Hide cursor
    stdscr.nodelay(True)  # Non-blocking input
    stdscr.timeout(100)  # Refresh rate

    while True:
        stdscr.clear()
        stdscr.addstr(2, 2, "Ready to start the game? Press any key to begin (or 'q' to quit)...", curses.color_pair(1))
        stdscr.refresh()
        
        key = stdscr.getch()
        if key == ord('q'):  # Quit if 'q' is pressed
            return
        if key != -1:  # If any other key is pressed, start game
            break

    score = 0
    start_time = time.time()

    while True:
        stdscr.clear()
        elapsed_time = time.time() - start_time
        time_left = max(10 - int(elapsed_time), 0)  # Ensure time_left doesn't go negative
        
        # Display time left at top-left (updates live)
        stdscr.addstr(1, 2, f"Time Left: {time_left}s", curses.color_pair(1))
        # Display score at top-right
        stdscr.addstr(1, 50, f"Score: {score}", curses.color_pair(1))

        if time_left == 0:  # Check if time is up
            break  # Exit the game loop

        correct_answer = ask_question(stdscr)
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
            stdscr.addstr(1, 2, f"Time Left: {time_left}s", curses.color_pair(1))  # Update countdown
            stdscr.refresh()
            time.sleep(0.1)  # Refresh every 0.1s

            if time_left == 0:
                break  # Stop waiting when time runs out
        
        if time_left == 0:
            break  # If time is up, exit the game loop

        if user_input == correct_answer:
            score += 10
            stdscr.addstr(10, 4, "Correct!", curses.color_pair(1))
        else:
            stdscr.addstr(10, 4, "Incorrect!", curses.color_pair(1))
        
        stdscr.refresh()
        time.sleep(1.5)  # Short delay before next question

    # Game over screen
    stdscr.clear()
    stdscr.addstr(5, 10, f"Game over! Your score is: {score}", curses.color_pair(1))
    stdscr.refresh()
    time.sleep(3)  # Show score before resetting

    game_loop(stdscr)  # Restart game automatically

# Run the game
if __name__ == "__main__":
    try:
        curses.wrapper(game_loop)
    except KeyboardInterrupt:
        pass  # Allow clean exit with Ctrl+C
