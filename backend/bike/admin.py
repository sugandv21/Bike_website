from django.contrib import admin
from .models import HeroSection, HeroBikeImage, InfoSection, SupportFeature
from .models import Location, BuyBike
from django.contrib import admin
from .models import LastSection, LastSectionImage
from django.utils.html import format_html   
from .models import HomepageBanner, StatItem
from .models import TestimonialsSection, Testimonial
from .models import TrustedSection
from .models import FAQ
from .models import ContactConfig, ContactSubmission
from .models import AuthPageConfig, AuthImage
from .models import AboutSectionOne
from django.utils.html import format_html

from .models import AboutSection1, AboutSection2, AboutSection3, AboutSection3Image
from .models import SellBikePage, HowItWorks

class HowItWorksInline(admin.TabularInline):
    model = HowItWorks
    extra = 1

@admin.register(SellBikePage)
class SellBikePageAdmin(admin.ModelAdmin):
    list_display = ["id", "top_banner_text", "second_banner_top_text"]
    inlines = [HowItWorksInline]

@admin.register(HowItWorks)
class HowItWorksAdmin(admin.ModelAdmin):
    list_display = ["title", "page"]

@admin.register(AboutSection1)
class AboutSection1Admin(admin.ModelAdmin):
    list_display = ("title",)
    readonly_fields = ()
    # You probably want only one instance — you can enforce via UI or just create one.

@admin.register(AboutSection2)
class AboutSection2Admin(admin.ModelAdmin):
    list_display = ("overlay_title",)

class AboutSection3ImageInline(admin.TabularInline):
    model = AboutSection3Image
    extra = 1
    fields = ("image", "order",)
    sortable_field_name = "order"

@admin.register(AboutSection3)
class AboutSection3Admin(admin.ModelAdmin):
    list_display = ("title",)
    inlines = (AboutSection3ImageInline,)


@admin.register(AboutSectionOne)
class AboutSectionOneAdmin(admin.ModelAdmin):
    list_display = ("heading", "is_active", "order", "created_at")
    list_editable = ("is_active", "order")
    search_fields = ("heading", "content")
    readonly_fields = ("image_preview",)
    fields = ("heading", "content", "image_preview", "image", "alt_text", "is_active", "order")

    def image_preview(self, obj):
        if obj and getattr(obj, "image", None):
            try:
                return format_html('<img src="{}" style="max-height:140px;border-radius:8px;"/>', obj.image.url)
            except Exception:
                return "(image)"
        return "(no image)"
    image_preview.short_description = "Image preview"



class LastSectionImageInline(admin.TabularInline):
    model = LastSectionImage
    extra = 1
    fields = ("image_preview", "image", "title", "order_no", "alt_text")
    readonly_fields = ("image_preview",)
    ordering = ("order_no",)

    def image_preview(self, obj):
        # defensive: obj might be None in the "add new" inline row
        if obj and getattr(obj, "image", None):
            try:
                return format_html('<img src="{}" style="max-height:80px;"/>', obj.image.url)
            except Exception:
                # if image.url access fails for some reason, return a placeholder text
                return "(image)"
        return ""
    image_preview.short_description = "Preview"


@admin.register(LastSection)
class LastSectionAdmin(admin.ModelAdmin):
    list_display = ("heading", "created_at", "updated_at")
    inlines = [LastSectionImageInline]
    search_fields = ("heading",)
    ordering = ("-created_at",)




class HeroBikeImageInline(admin.TabularInline):  # or StackedInline if you prefer
    model = HeroBikeImage
    extra = 1  # show 1 empty form by default
    fields = ("image", "order")
    ordering = ("order",)


@admin.register(HeroSection)
class HeroSectionAdmin(admin.ModelAdmin):
    list_display = ("title", "button_text")
    list_display_links = ("title",)
    inlines = [HeroBikeImageInline]

@admin.register(InfoSection)
class InfoSectionAdmin(admin.ModelAdmin):
    list_display = ("order","id","button_text")
    list_editable = ("order",)
    list_display_links = ("id",)

@admin.register(SupportFeature)
class SupportFeatureAdmin(admin.ModelAdmin):
    list_display = ("order", "title", "arrow")
    list_editable = ("order",)
    list_display_links = ("title",)
    search_fields = ("title", "subtitle", "description")
   

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)



@admin.register(BuyBike)
class BuyBikeAdmin(admin.ModelAdmin):
    list_display = (
        "id", "title", "brand", "bike_model", "bike_variant", "price",
        "year", "kilometers", "owners", "transmission", "is_booked"
    )
    list_filter = (
        "brand", "category", "year", "fuel_type", "color", "is_booked",
        "refurbished", "registration_certificate", "finance", "insurance", "warranty",
        "owners", "transmission", "location"
    )
    search_fields = ("title", "brand", "description", "bike_model", "bike_variant")

    readonly_fields = (
        "created_at", "updated_at", 
        "featured_image_preview", 
        "variant1_preview", "variant2_preview",
        "variant3_preview", "variant4_preview", "variant5_preview"
    )

    def featured_image_preview(self, obj):
        if obj and obj.featured_image:
            return format_html('<img src="{}" style="max-height:120px;"/>', obj.featured_image.url)
        return ""
    featured_image_preview.short_description = "Featured preview"

    def variant1_preview(self, obj):
        return format_html('<img src="{}" style="max-height:100px;"/>', obj.variant_image1.url) if obj.variant_image1 else ""
    def variant2_preview(self, obj):
        return format_html('<img src="{}" style="max-height:100px;"/>', obj.variant_image2.url) if obj.variant_image2 else ""
    def variant3_preview(self, obj):
        return format_html('<img src="{}" style="max-height:100px;"/>', obj.variant_image3.url) if obj.variant_image3 else ""
    def variant4_preview(self, obj):
        return format_html('<img src="{}" style="max-height:100px;"/>', obj.variant_image4.url) if obj.variant_image4 else ""
    def variant5_preview(self, obj):
        return format_html('<img src="{}" style="max-height:100px;"/>', obj.variant_image5.url) if obj.variant_image5 else ""

    fieldsets = (
        ("Basic", {
            "fields": (
                "title",
                "description",
                ("price", "location"),
                "featured_image_preview",
                ("featured_image", "card_bg_image"),
            )
        }),
        ("Variant Thumbnails", {
            "fields": (
                "variant1_preview", "variant_image1",
                "variant2_preview", "variant_image2",
                "variant3_preview", "variant_image3",
                "variant4_preview", "variant_image4",
                "variant5_preview", "variant_image5",
            )
        }),
        ("Identity", {
            "fields": (
                ("brand", "category"),
                ("bike_model", "bike_variant"),
                ("year", "registration_year"),
            )
        }),
        ("Specifications", {
            "classes": ("wide",),
            "fields": (
                ("color", "fuel_type"),
                ("ignition_type", "transmission"),
                ("front_brake_type", "rear_brake_type"),
                ("abs", "odometer", "wheel_type"),
                ("engine_cc", "kilometers"),
            ),
        }),
        ("Ownership & RTO", {
            "fields": (
                ("owner", "owners"),
                ("rto_state", "rto_city"),
            )
        }),
        ("Flags & Status", {
            "fields": (
                "refurbished",
                "registration_certificate",
                "finance",
                "insurance",
                "warranty",
                "is_booked",
            )
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
        }),
    )


class StatItemInline(admin.TabularInline):
    model = StatItem
    extra = 1
    fields = ("icon", "value", "caption", "order", "is_visible")

@admin.register(HomepageBanner)
class HomepageBannerAdmin(admin.ModelAdmin):
    list_display = ("title", "is_active", "created_at")
    inlines = [StatItemInline]
    # show banner images in the form
    fieldsets = (
        (None, {
            "fields": ("title", "logo", "is_active")
        }),
    )
    list_filter = ("is_active", "created_at")
    search_fields = ("title",)
    
@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "is_visible", "order", "created_at")
    list_filter = ("is_visible",)
    search_fields = ("name", "role", "quote")
    ordering = ("order",)

@admin.register(TestimonialsSection)
class TestimonialsSectionAdmin(admin.ModelAdmin):
    list_display = ("title", "is_active", "created_at")
    fields = ("title", "subtitle", "is_active")
    
@admin.register(TrustedSection)
class TrustedSectionAdmin(admin.ModelAdmin):
    list_display = ("title", "is_active", "created_at")
    fields = ("title", "description", "image", "is_active")
    list_filter = ("is_active", "created_at")
    search_fields = ("title", "description")
    

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ("question", "order", "is_active")
    list_editable = ("order", "is_active")
    search_fields = ("question", "answer")
    ordering = ("order",)


@admin.register(ContactConfig)
class ContactConfigAdmin(admin.ModelAdmin):
    list_display = ("heading", "is_active", "created_at")
    fields = ("heading","subheading","address","map_embed_url","phone","website","email","reason_choices","found_us_choices","is_active")
    search_fields = ("heading","address","phone","website","email")


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ("name","email","phone","reason","created_at","sent_email")
    readonly_fields = ("created_at",)
    search_fields = ("name","email","phone","message")
    list_filter = ("sent_email","created_at")


@admin.register(AuthPageConfig)
class AuthPageConfigAdmin(admin.ModelAdmin):
    list_display = ("recipient_email", "send_welcome_email", "is_active", "created_at")
    fields = ("recipient_email", "send_welcome_email", "is_active")
    search_fields = ("recipient_email",)


@admin.register(AuthImage)
class AuthImageAdmin(admin.ModelAdmin):
    list_display = ("preview", "title", "is_active", "created_at")
    readonly_fields = ("preview",)
    fields = ("preview", "title", "image", "is_active")
    search_fields = ("title",)

    def preview(self, obj):
        """
        Shows a nice preview with the rounded border similar to the front-end style.
        This is only admin preview — front-end border is applied in React/CSS.
        """
        if obj and getattr(obj, "image", None):
            return format_html(
                '<div style="padding:8px;background:#0f4b56;border-radius:28px;display:inline-block;">'
                '<img src="{}" style="display:block;border-radius:18px;border:6px solid #0f4b56;max-width:360px;height:auto;" />'
                '</div>',
                obj.image.url
            )
        return "(no image)"
    preview.short_description = "Preview"
