from django.db import models
from django.conf import settings
from django.db import models

class SellBikePage(models.Model):
    # Top Banner Section
    top_banner_image = models.ImageField(upload_to="sellbike/")
    top_banner_text = models.TextField()

    # Second Banner Section
    second_banner_image = models.ImageField(upload_to="sellbike/")
    second_banner_top_text = models.TextField(blank=True, null=True, help_text="Supports HTML tags")
    second_banner_bottom_text = models.CharField(max_length=200, blank=True, null=True)

    # Dropdown fields (optional, can store as choices)
    brand_options = models.TextField(help_text="Comma separated values", blank=True, null=True)
    model_options = models.TextField(help_text="Comma separated values", blank=True, null=True)
    variant_options = models.TextField(help_text="Comma separated values", blank=True, null=True)
    year_options = models.TextField(help_text="Comma separated values", blank=True, null=True)
    kms_options = models.TextField(help_text="Comma separated values", blank=True, null=True)
    owner_options = models.TextField(help_text="Comma separated values", blank=True, null=True)

    # Third Section
    third_title = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return "Sell Bike Page"


class HowItWorks(models.Model):
    page = models.ForeignKey(SellBikePage, related_name="how_it_works", on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to="sellbike/")

    def __str__(self):
        return self.title

class LastSection(models.Model):
    """
    Represents a 'section' that contains a heading and an ordered set of images.
    Admins can create multiple LastSection records; the API returns the latest one
    (or you can list them).
    """
    heading = models.CharField(max_length=255, blank=True, null=True)
    subtitle = models.TextField(blank=True, null=True)   # optional
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Last Section"
        verbose_name_plural = "Last Sections"

    def __str__(self):
        return self.heading or f"LastSection #{self.pk}"


class LastSectionImage(models.Model):
    """
    Images for LastSection. Order is controlled by order_no (lower => shown earlier).
    Stores an ImageField so Django will provide .url if MEDIA is configured.
    """
    section = models.ForeignKey(LastSection, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="last_section/", help_text="Upload the step image")
    title = models.CharField(max_length=255, blank=True, null=True, help_text="Image title / caption")
    order_no = models.PositiveSmallIntegerField(default=0, help_text="Order (0 = first)")
    alt_text = models.CharField(max_length=255, blank=True, null=True, help_text="Optional alt text for accessibility")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order_no", "pk"]
        verbose_name = "Last Section Image"
        verbose_name_plural = "Last Section Images"

    def __str__(self):
        return self.title or f"Image #{self.pk} (order {self.order_no})"


User = settings.AUTH_USER_MODEL

class Booking(models.Model):
    STATUS_CHOICES = [
        ("created", "Created"),
        ("paid", "Paid"),
        ("cancelled", "Cancelled"),
    ]

    buybike = models.ForeignKey("BuyBike", on_delete=models.CASCADE, related_name="bookings")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    # server-computed amounts (subtotal == bike.price)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)      # subtotal (bike price)
    gst_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # computed GST
    test_drive_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="created")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Booking #{self.id} for {self.buybike.title}"


class HeroSection(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    button_text = models.CharField(max_length=50, default="Buy Now")
    trapezoid_image = models.ImageField(upload_to="hero/trapezoid/")

    def __str__(self):
        return self.title


class HeroBikeImage(models.Model):
    hero_section = models.ForeignKey(
        HeroSection,
        related_name="bike_images",
        on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to="hero/bike/")
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("order",)

    def __str__(self):
        return f"{self.hero_section.title} - Bike Image {self.order}"



class InfoSection(models.Model):
    description = models.TextField(blank=True)
    button_text = models.CharField(max_length=50, default="Read More")
    bike_image = models.ImageField(upload_to="info_section/")
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("order",)

    def __str__(self):
        return f"InfoSection {self.id}"


class SupportFeature(models.Model):
    ARROW_CHOICES = [
        ("up", "Up"),
        ("down", "Down"),
    ]
    title = models.CharField(max_length=120)
    subtitle = models.CharField(max_length=140, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="support_features/")
    # arrow image (uploaded asset; e.g. up arrow / down arrow png/svg)
    arrow_image = models.ImageField(upload_to="support_features/arrows/", blank=True, null=True)
    arrow = models.CharField(max_length=4, choices=ARROW_CHOICES, default="up")
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("order",)

    def __str__(self):
        return f"{self.order} - {self.title}"


class Location(models.Model):
    name = models.CharField(max_length=150, unique=True)
    image = models.ImageField(upload_to="locations/", blank=True, null=True)

    def __str__(self):
        return self.name

class BuyBike(models.Model):
    TRANSMISSION_CHOICES = [
        ("manual", "Manual"),
        ("auto", "Auto"),
        ("semi-auto", "Semi-Auto"),
    ]

    OWNER_CHOICES = [
        ("1st Owner", "1st Owner"),
        ("2nd Owner", "2nd Owner"),
        ("3rd Owner", "3rd Owner"),
        ("4th+ Owner", "4th+ Owner"),
    ]

    ODOMETER_CHOICES = [
        ("analogue", "Analogue"),
        ("digital", "Digital"),
        ("both", "Both"),
    ]

    # Core details
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.PositiveIntegerField()
    location = models.ForeignKey(
        "Location", on_delete=models.SET_NULL, null=True, blank=True, related_name="buybikes"
    )

    # basic meta
    brand = models.CharField(max_length=100, blank=True)
    bike_model = models.CharField(max_length=150, blank=True)
    bike_variant = models.CharField(max_length=120, blank=True)
    year = models.PositiveSmallIntegerField(null=True, blank=True)
    registration_year = models.PositiveSmallIntegerField(null=True, blank=True)
    kilometers = models.PositiveIntegerField(null=True, blank=True)
    engine_cc = models.PositiveSmallIntegerField(null=True, blank=True)
    fuel_type = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=50, blank=True)
    category = models.CharField(max_length=100, blank=True)

    # ownership & transmission
    owner = models.CharField(max_length=150, blank=True)
    owners = models.CharField(max_length=20, choices=OWNER_CHOICES, blank=True, null=True)

    transmission = models.CharField(
        max_length=12, choices=TRANSMISSION_CHOICES, blank=True, null=True
    )

    # RTO/registration
    rto_state = models.CharField(max_length=120, blank=True)
    rto_city = models.CharField(max_length=120, blank=True)

    # yes/no flags
    refurbished = models.BooleanField(default=False)
    registration_certificate = models.BooleanField(default=False)
    finance = models.BooleanField(default=False)
    insurance = models.BooleanField(default=False)
    warranty = models.BooleanField(default=False)
    is_booked = models.BooleanField(default=False)

    # images
    featured_image = models.ImageField(upload_to="buybikes/images/", blank=True, null=True)
    card_bg_image = models.ImageField(upload_to="buybikes/card_bg/", blank=True, null=True)

    # ✅ 5 Variant Thumbnails
    variant_image1 = models.ImageField(upload_to="buybikes/variants/", blank=True, null=True)
    variant_image2 = models.ImageField(upload_to="buybikes/variants/", blank=True, null=True)
    variant_image3 = models.ImageField(upload_to="buybikes/variants/", blank=True, null=True)
    variant_image4 = models.ImageField(upload_to="buybikes/variants/", blank=True, null=True)
    variant_image5 = models.ImageField(upload_to="buybikes/variants/", blank=True, null=True)

    # specs
    ignition_type = models.CharField(max_length=120, blank=True, help_text="e.g. Kick & Self Start")
    front_brake_type = models.CharField(max_length=120, blank=True, help_text="e.g. Drum / Disc")
    rear_brake_type = models.CharField(max_length=120, blank=True, help_text="e.g. Drum / Disc")
    abs = models.BooleanField(default=False)
    odometer = models.CharField(max_length=20, choices=ODOMETER_CHOICES, blank=True, null=True)
    wheel_type = models.CharField(max_length=120, blank=True, help_text="e.g. Steel / Alloy")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        db_table = "buybike"

    def __str__(self):
        return self.title





def banner_upload_to(instance, filename):
    return f"homepage/banner/{filename}"

def stat_icon_upload_to(instance, filename):
    return f"homepage/stat_icons/{filename}"

class HomepageBanner(models.Model):
    title = models.CharField(max_length=255, help_text="Big heading text")
    logo = models.ImageField(blank=True, null=True, upload_to=banner_upload_to)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"Banner: {self.title[:40]}"

class StatItem(models.Model):
    banner = models.ForeignKey(HomepageBanner, on_delete=models.CASCADE, related_name="stats")
    icon = models.ImageField(blank=True, null=True, upload_to=stat_icon_upload_to)
    value = models.CharField(max_length=64)
    caption = models.CharField(max_length=128)
    order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ("order",)

    def __str__(self):
        return f"{self.value} — {self.caption}"
    

def testimonial_image_upload_to(instance, filename):
    return f"testimonials/{filename}"

class TestimonialsSection(models.Model):
    """Optional single record to control heading/subheading"""
    title = models.CharField(max_length=255, default="Real Stories From our Happy Customer")
    subtitle = models.CharField(max_length=512, blank=True, null=True,
                                default="Their words drive us forward and inspire others to join the movement.")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"Testimonials Section - {self.title[:40]}"

class Testimonial(models.Model):
    """
    Single testimonial uploaded via admin.
    """
    name = models.CharField(max_length=128)
    role = models.CharField(max_length=128, blank=True, null=True)  # e.g. "First-Time Buyer"
    quote = models.TextField()
    image = models.ImageField(upload_to=testimonial_image_upload_to, blank=True, null=True)
    is_visible = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0, help_text="Lower numbers appear first")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("order", "created_at")

    def __str__(self):
        return f"{self.name} — {self.role or 'testimonial'}"


def trusted_upload_to(instance, filename):
    return f"trusted_section/{filename}"

class TrustedSection(models.Model):
    """
    A single section controlling the 'Trusted by Riders Like You' area.
    Keep only one active record (or choose the latest active).
    """
    title = models.CharField(max_length=255, default="Trusted by Riders Like You")
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to=trusted_upload_to, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"TrustedSection - {self.title[:40]}"


class FAQ(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.question[:50]


class ContactConfig(models.Model):
    """
    Admin-managed content for the Contact page.
    Keep only one active config (frontend will fetch latest active).
    """
    heading = models.CharField(max_length=255, default="Contact Us")
    subheading = models.CharField(max_length=512, blank=True, null=True)
    address = models.TextField(blank=True, null=True, help_text="Full address/line breaks allowed")
    map_embed_url = models.URLField(blank=True, null=True, help_text="Full Google Maps share URL (embed or map link)")
    phone = models.CharField(max_length=64, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    reason_choices = models.JSONField(blank=True, null=True, default=list,
                                      help_text="JSON array of strings for 'Reason to Contact' dropdown")
    found_us_choices = models.JSONField(blank=True, null=True, default=list,
                                        help_text="JSON array of strings for 'How did you find us?' dropdown")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"ContactConfig (active={self.is_active})"


class ContactSubmission(models.Model):
    """
    Saved submissions from the frontend form (visible in admin).
    """
    config = models.ForeignKey(ContactConfig, on_delete=models.SET_NULL, null=True, blank=True, related_name="submissions")
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=64, blank=True, null=True)
    reason = models.CharField(max_length=255, blank=True, null=True)
    found_us = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_email = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.email} ({self.created_at:%Y-%m-%d %H:%M})"


def auth_image_upload_to(instance, filename):
    return f"auth_images/{filename}"

class AuthPageConfig(models.Model):
    """
    Configuration used by the auth (login/signup) page.
    Admin can set a recipient email (notifications) and toggle sending welcome-mail.
    """
    recipient_email = models.EmailField(
        blank=True,
        null=True,
        help_text="If set, registration notification emails will be sent here. Otherwise EMAIL_HOST_USER is used."
    )
    send_welcome_email = models.BooleanField(default=True, help_text="Send a welcome email to user after registration")
    is_active = models.BooleanField(default=True, help_text="Only the latest active config is used by the frontend")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "Auth Page Config"
        verbose_name_plural = "Auth Page Configs"

    def __str__(self):
        return f"AuthConfig ({self.recipient_email or 'default'})"


class AuthImage(models.Model):
    """
    Admin-uploaded image for the auth page left pane.
    Frontend will usually fetch the latest active image.
    """
    title = models.CharField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to=auth_image_upload_to)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "Auth Image"
        verbose_name_plural = "Auth Images"

    def __str__(self):
        return self.title or f"AuthImage #{self.pk}"


def about_section_upload_to(instance, filename):
    return f"about/section1/{filename}"

class AboutSectionOne(models.Model):
    """
    Admin-managed content for About > Section 1.
    Frontend will fetch the latest active record.
    """
    heading = models.CharField(max_length=255, blank=True, null=True)
    content = models.TextField(blank=True, null=True, help_text="HTML allowed")
    image = models.ImageField(upload_to=about_section_upload_to, blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True, help_text="Only active records are used by the frontend")
    order = models.PositiveIntegerField(default=0, help_text="Lower numbers show first if multiple records")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("order", "-created_at")
        verbose_name = "About Section 1"
        verbose_name_plural = "About Section 1s"

    def __str__(self):
        return self.heading or f"About Section 1 #{self.pk}"




class AboutSection1(models.Model):
    title = models.CharField(max_length=255, default="About Us")
    content = models.TextField(blank=True)
    image = models.ImageField(upload_to="about/section1/")

    class Meta:
        verbose_name = "About - Section 1"
        verbose_name_plural = "About - Section 1"

    def __str__(self):
        return self.title


class AboutSection2(models.Model):
    background_image = models.ImageField(upload_to="about/section2/")
    overlay_title = models.CharField(max_length=255, blank=True)
    overlay_text = models.TextField(blank=True)

    class Meta:
        verbose_name = "About - Section 2"
        verbose_name_plural = "About - Section 2"

    def __str__(self):
        return self.overlay_title or "Section 2 Banner"


class AboutSection3(models.Model):
    title = models.CharField(max_length=255, blank=True, default="Our Approach")
    content = models.TextField(blank=True)

    class Meta:
        verbose_name = "About - Section 3"
        verbose_name_plural = "About - Section 3"

    def __str__(self):
        return self.title or "Section 3"


class AboutSection3Image(models.Model):
    section = models.ForeignKey(
        AboutSection3, related_name="images", on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to="about/section3/")
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("order",)
        verbose_name = "About - Section 3 Image"
        verbose_name_plural = "About - Section 3 Images"

    def __str__(self):
        return f"Image {self.pk} for {self.section}"
