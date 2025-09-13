from django.urls import path
from .views import HeroSectionList, InfoSectionList, SupportFeatureList
from .views import BuyBikeList, BuyBikeDetail, BookingCreateView, BookingDetailView, BookingConfirmPaymentAPIView
from .views import LastSectionLatestAPIView
from .views import HomepageBannerAPIView
from .views import TestimonialsAPIView
from .views import TrustedSectionAPIView
from .views import FAQListAPIView
from .views import ContactConfigAPIView, ContactSubmitAPIView
from .views import RegisterAPIView, LoginAPIView, LogoutAPIView, AuthImageAPIView
from .views import AboutSectionOneAPIView
from .views import AboutAPIView
from .views import SellBikePageView


urlpatterns = [
    path("hero/", HeroSectionList.as_view(), name="hero-section"),
    path("info/", InfoSectionList.as_view(), name="info-section"),
    path("support/", SupportFeatureList.as_view(), name="support-features"),
    path("homepage-banner/", HomepageBannerAPIView.as_view(), name="homepage-banner"),
    path("buybikes/", BuyBikeList.as_view(), name="buybike-list"),
    path("buybikes/<int:pk>/", BuyBikeDetail.as_view(), name="buybike-detail"),
    path("bookings/", BookingCreateView.as_view(), name="booking-create"),
    path("bookings/<int:pk>/", BookingDetailView.as_view(), name="booking-detail"),
    path("bookings/<int:pk>/confirm-payment/", BookingConfirmPaymentAPIView.as_view(), name="booking-confirm"),
    path("last-section/", LastSectionLatestAPIView.as_view(), name="last-section-latest"),
    path("testimonials/", TestimonialsAPIView.as_view(), name="testimonials"),
    path("trusted-section/", TrustedSectionAPIView.as_view(), name="trusted-section"),
    path("faqs/", FAQListAPIView.as_view(), name="faq-list"),
    path("contact-config/", ContactConfigAPIView.as_view(), name="contact-config"),
    path("contact-submit/", ContactSubmitAPIView.as_view(), name="contact-submit"),
     path("auth/register/", RegisterAPIView.as_view(), name="api-register"),
    path("auth/login/", LoginAPIView.as_view(), name="api-login"),
    path("auth/logout/", LogoutAPIView.as_view(), name="api-logout"),
    path("auth/image/", AuthImageAPIView.as_view(), name="api-auth-image"),
    path("about/section1/", AboutSectionOneAPIView.as_view(), name="about-section1"),
     path("about/", AboutAPIView.as_view(), name="api-about"),
       path("sellbike/", SellBikePageView.as_view(), name="sellbike-page"),
    
]
