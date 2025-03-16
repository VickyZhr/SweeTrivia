import pygame
import random

# Initialize Pygame
pygame.init()

# Screen Size
WIDTH, HEIGHT = 1200, 620
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Flappy Bird - Challenge Mode")

# Colors
WHITE = (255, 255, 255)
SKY = (114, 198, 206)
BLACK = (0, 0, 0)
GREEN = (0, 200, 0)
RED = (255, 0, 0)

# Game Variables
bird_x, bird_y = 200, 200
bird_radius = 10
gravity = 0.5
velocity = 0
jump_strength = -6
pipe_x = WIDTH
pipe_gap = 60
pipe_width = 40
pipe_height = random.randint(50, HEIGHT - pipe_gap - 50)
score = 0
lives = 3  # Challenge Mode: 3 Lives
moving_rate = 10
game_started = False
passed_pipe = False
missed_pipe = False  # Ensure lives are reduced only once per pipe

# Flash effect variables
flash_timer = 0
flash_duration = 20  # Number of frames to flash the text
flash_active = False


# Questions and Answers
questions = [
    {"question": "How many legs does a spider have?", "options": ["2", "4", "6", "8"], "correct": "A"},
    {"question": "What is the capital of France?", "options": ["Berlin", "Madrid", "Paris", "Rome"], "correct": "A"},
    {"question": "What is 5 + 5?", "options": ["8", "9", "10", "11"], "correct": "A"},
]
current_question = random.choice(questions)

# Load Font
font = pygame.font.Font(None, 20)

import random

# def draw_pipes(pipe_x):
#     """Draws the answer choices between the gaps."""
#     labels = ["A", "B", "C", "D"]
    
#     # Define gap size as five times the bird radius
#     gap_size = 5 * bird_radius
    
#     # Generate random position for the first gap
#     first_gap = random.randint(100, HEIGHT - 4 * gap_size - 100)
#     gap_positions = [
#         first_gap,
#         first_gap + gap_size + 50,
#         first_gap + 2 * (gap_size + 50),
#         first_gap + 3 * (gap_size + 50)
#     ]
    
#     # Draw pipes above and below the gaps
#     pygame.draw.rect(screen, GREEN, (pipe_x, 0, pipe_width, gap_positions[0]))
#     pygame.draw.rect(screen, GREEN, (pipe_x, gap_positions[0] + gap_size, pipe_width, gap_positions[1] - (gap_positions[0] + gap_size)))
#     pygame.draw.rect(screen, GREEN, (pipe_x, gap_positions[1] + gap_size, pipe_width, gap_positions[2] - (gap_positions[1] + gap_size)))
#     pygame.draw.rect(screen, GREEN, (pipe_x, gap_positions[2] + gap_size, pipe_width, gap_positions[3] - (gap_positions[2] + gap_size)))
#     pygame.draw.rect(screen, GREEN, (pipe_x, gap_positions[3] + gap_size, pipe_width, HEIGHT - (gap_positions[3] + gap_size)))
    
#     # Draw answer labels inside the gaps
#     for i in range(4):
#         text = font.render(labels[i], True, WHITE)
#         screen.blit(text, (pipe_x + pipe_width // 2 - 10, gap_positions[i] + gap_size // 2))

gap_positions = [150, 250, 350, 450]  # Fixed gap positions

def draw_pipes(pipe_x, bird_y, current_question):
    """Draws the answer choices between the fixed gaps and checks if the player selects the correct answer."""
    global lives, score, passed_pipe, missed_pipe, flash_active, flash_timer  # Add `flash_active` and `flash_timer`

    labels = ["A", "B", "C", "D"]
    gap_size = 5 * bird_radius

    # Draw pipes above and below the gaps
    pygame.draw.rect(screen, GREEN, (pipe_x, 0, pipe_width, gap_positions[0]))
    pygame.draw.rect(screen, GREEN, (pipe_x, gap_positions[0] + gap_size, pipe_width, gap_positions[1] - (gap_positions[0] + gap_size)))
    pygame.draw.rect(screen, GREEN, (pipe_x, gap_positions[1] + gap_size, pipe_width, gap_positions[2] - (gap_positions[1] + gap_size)))
    pygame.draw.rect(screen, GREEN, (pipe_x, gap_positions[2] + gap_size, pipe_width, gap_positions[3] - (gap_positions[2] + gap_size)))
    pygame.draw.rect(screen, GREEN, (pipe_x, gap_positions[3] + gap_size, pipe_width, HEIGHT - (gap_positions[3] + gap_size)))

    # Draw answer labels inside the gaps
    for i in range(4):
        text = font.render(labels[i], True, WHITE)
        screen.blit(text, (pipe_x + pipe_width // 2 - 10, gap_positions[i] + gap_size // 2))

    # Check if the bird passes through the correct answer's gap
    correct_label = current_question["correct"]
    correct_index = labels.index(correct_label)

    if pipe_x < bird_x < pipe_x + pipe_width:
        if not (gap_positions[correct_index] <= bird_y <= gap_positions[correct_index] + gap_size):
            if not missed_pipe:  # Reduce life only if it's the first time missing this pipe
                lives -= 1
                flash_active = True  # Start flashing effect
                flash_timer = flash_duration  # Reset flash timer
                missed_pipe = True  # Prevent multiple life reductions
        elif not passed_pipe:  # Only increment score if not already counted
            score += 10
            passed_pipe = True  # Prevent multiple score increments

    # Flashing effect: Alternate red and white every few frames
    if flash_active and flash_timer > 0:
        text_color = RED if (flash_timer % 10 < 5) else WHITE  # Toggle color
        display_font = pygame.font.Font(None, 50)  # Bigger font when flashing
    else:
        text_color = WHITE  # Normal color when not flashing
        display_font = pygame.font.Font(None, 30)  # Normal size

    # Display score and lives in the top-right corner
    score_text = display_font.render(f"Score: {score}", True, text_color)
    lives_text = display_font.render(f"Lives: {lives}", True, text_color)
    screen.blit(score_text, (WIDTH - 200, 10))
    screen.blit(lives_text, (WIDTH - 200, 50))


bird_img = pygame.image.load("skeleton-animation_01.png")  # Load the bird image
bird_img = pygame.transform.scale(bird_img, (50, 40))  # Resize as needed

def draw_bird(bird_y):
    """Draws the bird using an image instead of a circle."""
    screen.blit(bird_img, (bird_x, int(bird_y)))

def draw_question():
    """Displays the current question dynamically with a transparent background."""
    padding = 15
    line_height = 25
    
    # Calculate dynamic box width based on the longest line of text
    text_widths = [font.size(current_question["question"])[0]]
    for option in current_question["options"]:
        text_widths.append(font.size(f"{chr(65 + current_question["options"].index(option))}. {option}")[0])
    box_width = max(text_widths) + 2 * padding  # Add padding to the longest text width
    
    box_x = 10  # Move the box to the leftmost corner
    box_y = 50  # Move down everything
    
    # Calculate dynamic box height based on the number of lines
    num_lines = 1 + len(current_question["options"])  # 1 for the question, others for options
    question_box_height = padding * 2 + num_lines * line_height
    
    # Create a transparent surface
    transparent_surface = pygame.Surface((box_width, question_box_height), pygame.SRCALPHA)
    transparent_surface.fill((0, 0, 0, 128))  # RGBA (Black with 50% opacity)
    screen.blit(transparent_surface, (box_x, box_y))
    
    # Render and display question text
    text = font.render(current_question["question"], True, WHITE)
    screen.blit(text, (box_x + padding, box_y + padding))
    
    # Render and display answer options
    for i, option in enumerate(current_question["options"]):
        text = font.render(f"{chr(65+i)}. {option}", True, WHITE)
        screen.blit(text, (box_x + padding, box_y + padding + (i + 1) * line_height))


def reset_game():
    """Resets game variables to start a new round."""
    global bird_y, velocity, pipe_x, score, lives, game_started, current_question
    bird_y = 200
    velocity = 0
    pipe_x = WIDTH
    score = 0
    lives = 3
    game_started = False
    current_question = random.choice(questions)
    show_start_screen()

def show_start_screen():
    """Displays the start screen with instructions."""
    screen.fill(SKY)
    text = font.render("TAP TO START", True, BLACK)
    screen.blit(text, (WIDTH//2 - 40, HEIGHT//2))
    pygame.display.update()

    waiting = True
    while waiting:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                exit()
            if event.type == pygame.KEYDOWN or event.type == pygame.MOUSEBUTTONDOWN:
                waiting = False

def show_game_over_screen():
    """Displays the game over screen and waits for restart input."""
    screen.fill(BLACK)
    text1 = font.render("GAME OVER", True, WHITE)
    text2 = font.render(f"Score: {score}", True, WHITE)
    text3 = font.render("Press SPACE to Restart", True, WHITE)

    screen.blit(text1, (WIDTH//2 - 40, HEIGHT//2 - 40))
    screen.blit(text2, (WIDTH//2 - 40, HEIGHT//2))
    screen.blit(text3, (WIDTH//2 - 80, HEIGHT//2 + 40))
    pygame.display.update()

    waiting = True
    while waiting:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                exit()
            if event.type == pygame.KEYDOWN and event.key == pygame.K_SPACE:
                waiting = False  # Restart game

    reset_game()
# Start Screen
show_start_screen()

# Main Game Loop
running = True
while running:
    screen.fill(SKY)  # Background color

    # Gravity and Bird Movement
    velocity += gravity
    bird_y += velocity

    # Move Pipes
    pipe_x -= moving_rate
    if pipe_x < -pipe_width:
        pipe_x = WIDTH
        current_question = random.choice(questions)  # Change to a new question
        passed_pipe = False  # Reset for the new pipe
        missed_pipe = False  # Reset missed pipe flag to allow life loss for the next pipe

    # Collision Detection (Hitting top/bottom)
    if bird_y <= 0 or bird_y >= HEIGHT - bird_radius:
        if lives > 0:  # Reduce lives only if lives remain
            lives -= 1
            flash_active = True  # Start flashing effect
            flash_timer = flash_duration  # Reset flash timer
            bird_y = HEIGHT // 2  # Reset bird position instead of ending game immediately
            velocity = 0  # Stop downward movement

    # Flashing Timer Countdown
    if flash_timer > 0:
        flash_timer -= 1
    else:
        flash_active = False  # Stop flashing after timer expires

    # If all lives are lost, show game over screen
    if lives == 0:
        show_game_over_screen()

    # Draw Objects
    draw_pipes(pipe_x, bird_y, current_question)  
    draw_bird(bird_y)
    draw_question()

    pygame.display.update()
    pygame.time.delay(30)

    # Check for Jump Input
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN or event.type == pygame.MOUSEBUTTONDOWN:
            velocity = jump_strength  # Make the bird jump

pygame.quit()
