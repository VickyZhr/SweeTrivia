import pygame
from screens.home_screen import HomeScreen

# Initialize Pygame
pygame.init()
SCREEN_WIDTH, SCREEN_HEIGHT = 1024, 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("SweeTrivia - Home Screen")

# Load homescreen
home_screen = HomeScreen(screen)

# Only displaying for now
running = True
while running:
    screen.fill((0, 0, 0))
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False  # Allow window to close

    # Draw the home screen safely
    try:
        home_screen.draw()
    except Exception as e:
        print(f"Error drawing screen: {e}")

    pygame.display.update()

# Quit Pygame properly
pygame.quit()
