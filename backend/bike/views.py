
from rest_framework import generics, filters
from .models import BuyBike
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import BuyBikeSerializer
from .models import HeroSection, InfoSection, SupportFeature
from .serializers import HeroSectionSerializer, InfoSectionSerializer, SupportFeatureSerializer
from .filters import BikeFilter  
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from .models import HomepageBanner
from .serializers import HomepageBannerSerializer

from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import BuyBike, Booking
from .serializers import BookingCreateSerializer, BookingDetailSerializer
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import LastSection
from .serializers import LastSectionSerializer
from .models import TestimonialsSection, Testimonial
from .serializers import TestimonialsSectionSerializer, TestimonialSerializer
from .models import TrustedSection
from .serializers import TrustedSectionSerializer
from rest_framework.generics import ListAPIView
from .models import FAQ
from .serializers import FAQSerializer

from .models import ContactConfig, ContactSubmission
from .serializers import ContactConfigSerializer, ContactSubmissionSerializer
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from rest_framework import status, permissions
from rest_framework.response import Response
from django.contrib.auth import login as django_login, logout as django_logout
from .serializers import RegisterSerializer, LoginSerializer, AuthImageSerializer
from django.contrib.auth.models import User
from .models import ContactConfig, BuyBike
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework import status
from .models import AboutSectionOne
from .serializers import AboutSectionOneSerializer

from .models import AboutSection1, AboutSection2, AboutSection3
from .serializers import (
    AboutSection1Serializer,
    AboutSection2Serializer,
    AboutSection3Serializer,
)
from rest_framework.generics import RetrieveAPIView
from .serializers import SellBikePageSerializer
from .models import SellBikePage



class AboutAPIView(APIView):
    """
    Return a single aggregated object containing section1, section2, section3.
    This matches the shape used by the React AboutPage component.
    """
    def get(self, request, *args, **kwargs):
        # pick the first instance of each (admin can keep only one).
        s1 = AboutSection1.objects.first()
        s2 = AboutSection2.objects.first()
        s3 = AboutSection3.objects.first()

        data = {
            "section1": AboutSection1Serializer(s1, context={"request": request}).data if s1 else {},
            "section2": AboutSection2Serializer(s2, context={"request": request}).data if s2 else {},
            "section3": AboutSection3Serializer(s3, context={"request": request}).data if s3 else {},
        }
        return Response(data, status=status.HTTP_200_OK)



class AboutSectionOneAPIView(APIView):
    """
    GET /api/about/section1/  -> returns the latest active AboutSectionOne object (single object)
    """
    permission_classes = []  # allow public GET; adjust if you require permissions

    def get(self, request, *args, **kwargs):
        obj = AboutSectionOne.objects.filter(is_active=True).order_by("order", "-created_at").first()
        if not obj:
            return Response({"detail": "Not configured"}, status=status.HTTP_404_NOT_FOUND)
        ser = AboutSectionOneSerializer(obj, context={"request": request})
        return Response(ser.data, status=status.HTTP_200_OK)


import logging

logger = logging.getLogger(__name__)
from .models import AuthImage


class AuthImageAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            # pick latest active auth image
            img = AuthImage.objects.filter(is_active=True, image__isnull=False).order_by("-created_at").first()
            if not img:
                return Response({"image_url": None})
            url = request.build_absolute_uri(img.image.url)
            return Response({"image_url": url})
        except Exception as exc:
            # log traceback to console / Django log so you can inspect it
            logger.exception("AuthImageAPIView error")
            # return non-error response to frontend to avoid the 500 Axios failure (you can change to 500 if you prefer)
            return Response({"image_url": None})

class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # send welcome email to user and notify admin (ContactConfig email if present)
        try:
            # recipient user
            subject_user = "Welcome — your account is created"
            body_user = f"Hi {user.first_name or user.username},\n\nYour account has been created successfully.\n\nRegards"
            send_mail(subject_user, body_user, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)

            # notify admin / site email
            config = ContactConfig.objects.filter(is_active=True).order_by("-created_at").first()
            admin_to = config.email if config and config.email else settings.EMAIL_HOST_USER
            subject_admin = "New user registered"
            body_admin = f"New user: {user.username} ({user.email})"
            send_mail(subject_admin, body_admin, settings.DEFAULT_FROM_EMAIL, [admin_to], fail_silently=True)
        except Exception as ex:
            # still proceed — but record or log in production
            print("Email sending failed on registration:", ex)

        return Response({"detail":"registered"}, status=status.HTTP_201_CREATED)

class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        django_login(request, user)  # create session cookie
        return Response({"detail":"logged-in", "username": user.username}, status=status.HTTP_200_OK)

class LogoutAPIView(APIView):
    def post(self, request):
        django_logout(request)
        return Response({"detail":"logged-out"}, status=status.HTTP_200_OK)

class LastSectionListCreateAPIView(generics.ListCreateAPIView):
    """
    GET: list all sections (most recent first)
    POST: create a new section (admin usage via API if desired)
    """
    queryset = LastSection.objects.all()
    serializer_class = LastSectionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # restrict POST to authenticated if you want


class LastSectionRetrieveAPIView(generics.RetrieveAPIView):
    queryset = LastSection.objects.all()
    serializer_class = LastSectionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class LastSectionLatestAPIView(generics.GenericAPIView):
    """
    Returns the latest (most recently created) LastSection.
    Useful for `/last-section/` endpoint that front-end will call.
    """
    serializer_class = LastSectionSerializer
    queryset = LastSection.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, *args, **kwargs):
        obj = self.get_queryset().order_by("-created_at").first()
        if not obj:
            return Response({"detail": "No sections found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(obj, context={"request": request})
        return Response(serializer.data)


# Create booking: server computes amounts and marks the BuyBike as booked
class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingCreateSerializer
    permission_classes = [AllowAny]  # change if you require auth

    def create(self, request, *args, **kwargs):
        # validate incoming payload
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        buybike = serializer.validated_data.get("buybike")
        test_drive_fee = float(serializer.validated_data.get("test_drive_fee", 0) or 0)

        # server-side compute: subtotal from buybike.price, gst 18%
        subtotal = float(getattr(buybike, "price", 0) or 0)
        gst_amount = round(subtotal * 0.18, 2)
        total_amount = round(subtotal + gst_amount + test_drive_fee, 2)

        user = request.user if request.user and request.user.is_authenticated else None

        booking = Booking.objects.create(
            buybike=buybike,
            user=user,
            amount=subtotal,
            gst_amount=gst_amount,
            test_drive_fee=test_drive_fee,
            total_amount=total_amount,
            status="created",
        )

        # mark the product as booked in the buybike table (for admin visibility)
        buybike.is_booked = True
        buybike.save(update_fields=["is_booked"])

        out = BookingDetailSerializer(booking, context={"request": request})
        headers = self.get_success_headers(out.data)
        return Response(out.data, status=status.HTTP_201_CREATED, headers=headers)


# Booking detail (used by payment page to show amounts)
class BookingDetailView(generics.RetrieveAPIView):
    queryset = Booking.objects.select_related("buybike").all()
    serializer_class = BookingDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


# Optional: lightweight confirm endpoint that only toggles booking.status to 'paid' (no payment details saved)
class BookingConfirmPaymentAPIView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def post(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk)

        if booking.status == "paid":
            return Response({"detail": "Already paid"}, status=status.HTTP_400_BAD_REQUEST)

        # toggle paid — do NOT save payment_method or payment_reference (as requested)
        booking.status = "paid"
        booking.save(update_fields=["status"])

        return Response({"detail": "Booking marked as paid"}, status=status.HTTP_200_OK)



class HeroSectionList(generics.ListAPIView):
    queryset = HeroSection.objects.all()
    serializer_class = HeroSectionSerializer

class InfoSectionList(generics.ListAPIView):
    queryset = InfoSection.objects.all()
    serializer_class = InfoSectionSerializer

class SupportFeatureList(generics.ListAPIView):
    queryset = SupportFeature.objects.all()
    serializer_class = SupportFeatureSerializer

class BuyBikeList(generics.ListAPIView):
    queryset = BuyBike.objects.all()
    serializer_class = BuyBikeSerializer

    # enable django-filter + DRF search & ordering
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = BikeFilter

    ordering_fields = ["created_at", "price", "kilometers", "year"]
    ordering = ["-created_at"]
    # keep DRF search, but our BikeFilter also provides 'search' param; both can coexist
    search_fields = ["title", "brand", "category", "description", "location__name"]


class BuyBikeDetail(generics.RetrieveAPIView):
    queryset = BuyBike.objects.select_related("location").all()
    serializer_class = BuyBikeSerializer

class HomepageBannerAPIView(APIView):
    def get(self, request, *args, **kwargs):
        banner = HomepageBanner.objects.filter(is_active=True).order_by("-created_at").first()
        if not banner:
            return Response({"detail": "No banner configured."}, status=status.HTTP_404_NOT_FOUND)
        serializer = HomepageBannerSerializer(banner, context={"request": request})
        return Response(serializer.data)
    
class TestimonialsAPIView(APIView):
    """
    Returns:
    {
      "section": { "title": "...", "subtitle": "..."},
      "testimonials": [ { id,name,role,quote,image_url }, ... ]
    }
    """
    def get(self, request, *args, **kwargs):
        # pick latest active section (or none)
        section = TestimonialsSection.objects.filter(is_active=True).order_by("-created_at").first()
        section_data = TestimonialsSectionSerializer(section).data if section else None

        # get visible testimonials ordered by 'order'
        testimonials_qs = Testimonial.objects.filter(is_visible=True).order_by("order", "created_at")
        serializer = TestimonialSerializer(testimonials_qs, many=True, context={"request": request})
        return Response({"section": section_data, "testimonials": serializer.data})
    
class TrustedSectionAPIView(APIView):
    """
    Returns the latest active TrustedSection (GET /api/trusted-section/).
    """
    def get(self, request, *args, **kwargs):
        obj = TrustedSection.objects.filter(is_active=True).order_by("-created_at").first()
        if not obj:
            return Response({"detail": "Not configured"}, status=status.HTTP_404_NOT_FOUND)
        serializer = TrustedSectionSerializer(obj, context={"request": request})
        return Response(serializer.data)
    
class FAQListAPIView(ListAPIView):
    queryset = FAQ.objects.filter(is_active=True).order_by("order")
    serializer_class = FAQSerializer
    
    


class ContactConfigAPIView(generics.RetrieveAPIView):
    """
    GET latest active ContactConfig
    """
    serializer_class = ContactConfigSerializer
    queryset = ContactConfig.objects.filter(is_active=True).order_by("-created_at")

    def get(self, request, *args, **kwargs):
        obj = self.get_queryset().first()
        if not obj:
            return Response({"detail": "Not configured."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(obj, context={"request": request})
        return Response(serializer.data)


class ContactSubmitAPIView(generics.CreateAPIView):
    serializer_class = ContactSubmissionSerializer
    queryset = ContactSubmission.objects.all()

    def create(self, request, *args, **kwargs):
        # Save submission (server-side)
        # Optionally associate with latest ContactConfig
        config = ContactConfig.objects.filter(is_active=True).order_by("-created_at").first()
        data = request.data.copy()
        if config:
            data["config"] = config.pk
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        submission = serializer.save()

        # send an email to site email
        try:
            subject = f"New Contact Form Submission: {submission.name}"
            body_lines = [
                f"Name: {submission.name}",
                f"Email: {submission.email}",
                f"Phone: {submission.phone or '-'}",
                f"Reason: {submission.reason or '-'}",
                f"Found via: {submission.found_us or '-'}",
                "",
                "Message:",
                (submission.message or "-")
            ]
            body = "\n".join(body_lines)

            send_mail(
                subject,
                body,
                settings.DEFAULT_FROM_EMAIL,
                [settings.EMAIL_HOST_USER],  # receives admin email (you can change)
                fail_silently=False,
            )
            submission.sent_email = True
            submission.save(update_fields=["sent_email"])
        except Exception as ex:
            # Log if you have logging; but still return success to user about saving
            # do not raise 500 for email send failure in production - but you can change behavior
            print("Email send failed:", ex)

        out = ContactSubmissionSerializer(submission, context={"request": request})
        return Response(out.data, status=status.HTTP_201_CREATED)


class SellBikePageView(RetrieveAPIView):
    queryset = SellBikePage.objects.all()
    serializer_class = SellBikePageSerializer

    def get_object(self):
        return SellBikePage.objects.first()