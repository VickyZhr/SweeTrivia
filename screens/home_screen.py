import pygame

class HomeScreen:
    def __init__(self, screen):
        self.screen = screen
        self.bg_color = (224, 23, 140)  # E0178C

        # Load images safely
        self.bg_shape_top = self.load_image("assets/bg_shape_top.png")
        self.title = self.load_image("assets/title.png")
        self.select_mode = self.load_image("assets/select_mode.png")
        self.standard_button = self.load_image("assets/standard_button.png")
        self.challenge_button = self.load_image("assets/challenge_button.png")
        self.bg_shape_bottom = self.load_image("assets/bg_shape_bottom.png")

        self.bg_shape_top, self.bg_shape_top_rect = self.scale_image(
            self.bg_shape_top, scale_factor=1, center_pos=(600, 100)
        )
        self.title, self.title_rect = self.scale_image(
            self.title, scale_factor=0.80, center_pos=(600, 220)
        )
        self.select_mode, self.select_mode_rect = self.scale_image(
            self.select_mode, scale_factor=0.80, center_pos=(600, 300)
        )
        self.standard_button, self.standard_button_rect = self.scale_image(
            self.standard_button, size=(250, 100), center_pos=(400, 400)
        )
        self.challenge_button, self.challenge_button_rect = self.scale_image(
            self.challenge_button, size=(250, 100), center_pos=(800, 400)
        )
        self.bg_shape_bottom, self.bg_shape_bottom_rect = self.scale_image(
            self.bg_shape_bottom, scale_factor=1, center_pos=(600, 630)
        )

    def load_image(self, path):
        try:
            return pygame.image.load(path)
        except pygame.error as e:
            print(f"Error loading {path}: {e}")
            return None

    def scale_image(self, image, scale_factor=None, size=None, center_pos=None):
        """
        Scales an image while maintaining aspect ratio or using a fixed size.

        Args:
            image (pygame.Surface): The image to scale.
            scale_factor (float, optional): Multiplier for scaling.
            size (tuple, optional): New width and height.
            center_pos (tuple, optional): Center position of the scaled image.

        Returns:
            pygame.Surface, pygame.Rect: Scaled image and its rectangle.
        """
        if image is None:
            return None, pygame.Rect(0, 0, 0, 0)

        # Get original size
        original_size = image.get_size()

        # Scale using factor OR set a fixed size
        if size:
            new_size = size  # Use fixed size
        elif scale_factor:
            new_size = (int(original_size[0] * scale_factor), int(original_size[1] * scale_factor))
        else:
            new_size = original_size  # Keep original size if no scaling applied

        # Scale the image
        scaled_image = pygame.transform.scale(image, new_size)

        # Get rect with optional centering
        rect = scaled_image.get_rect()
        if center_pos:
            rect.center = center_pos
        return scaled_image, rect

    def draw(self):
        self.screen.fill(self.bg_color)  # Set solid background color
        # Draw background shapes
        if self.bg_shape_top:
            self.screen.blit(self.bg_shape_top, self.bg_shape_top_rect.topleft)
        if self.bg_shape_bottom:
            self.screen.blit(self.bg_shape_bottom, self.bg_shape_bottom_rect.topleft)

        # Draw title and text
        # self.screen.blit: top-left coord.
        if self.title:
            self.screen.blit(self.title, self.title_rect.topleft)

        if self.title:
            self.screen.blit(self.select_mode, self.select_mode_rect.topleft)

        # Draw buttons
        if self.standard_button:
            self.screen.blit(self.standard_button, self.standard_button_rect.topleft)
        if self.challenge_button:
            self.screen.blit(self.challenge_button, self.challenge_button_rect.topleft)

    def update(self):
        # Plan to add animations here in the future
        pass
