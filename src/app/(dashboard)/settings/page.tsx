'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, PlusCircle, Trash2 } from 'lucide-react';
import { getSettings, updateSettings } from '@/lib/api';
import type { SiteSettings, SiteLocation, LocalizedValue } from '@/types';

type SettingsSection = 'general' | 'contact' | 'social' | 'seo' | 'locations';

export default function SettingsPage() {
  const [isFetching, setIsFetching] = useState(true);
  const [savingSection, setSavingSection] = useState<SettingsSection | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'SeaMoneeCredit',
    taglineEn: 'Your Trusted Financial Partner',
    taglineMs: 'Rakan Kewangan Anda Yang Dipercayai',
    companyName: 'SeaMonee Credit Sdn Bhd',
    registrationNumber: '',
    licenseNumber: '',
  });

  const [contactSettings, setContactSettings] = useState({
    phone: '+60-3-XXXX-XXXX',
    whatsapp: '+60-12-XXX-XXXX',
    email: 'info@seamoneecredit.com',
    addressEn: '',
    addressMs: '',
    businessHoursEn: 'Monday - Friday: 9:00 AM - 6:00 PM',
    businessHoursMs: 'Isnin - Jumaat: 9:00 PG - 6:00 PTG',
    googleMapsUrl: '',
    geoLat: '',
    geoLng: '',
  });

  const [socialSettings, setSocialSettings] = useState({
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
  });

  const [seoSettings, setSeoSettings] = useState({
    defaultTitleEn: 'Personal Loan Malaysia | SeaMoneeCredit',
    defaultTitleMs: 'Pinjaman Peribadi Malaysia | SeaMoneeCredit',
    defaultDescEn: 'Apply for personal loan in Malaysia with interest rates from 4.88% p.a.',
    defaultDescMs: 'Mohon pinjaman peribadi di Malaysia dengan kadar faedah dari 4.88% p.a.',
    googleVerification: '',
    googleAnalyticsId: '',
    facebookPixelId: '',
  });

  const [locations, setLocations] = useState<SiteLocation[]>([]);

  const applySettings = (settings: SiteSettings) => {
    setGeneralSettings({
      siteName: settings.siteName || '',
      taglineEn: settings.tagline?.en || '',
      taglineMs: settings.tagline?.ms || '',
      companyName: settings.legal?.companyName || '',
      registrationNumber: settings.legal?.registrationNumber || '',
      licenseNumber: settings.legal?.licenseNumber || '',
    });
    setContactSettings({
      phone: settings.contact?.phone || '',
      whatsapp: settings.contact?.whatsapp || '',
      email: settings.contact?.email || '',
      addressEn: settings.contact?.address?.en || '',
      addressMs: settings.contact?.address?.ms || '',
      businessHoursEn: settings.businessHours?.en || '',
      businessHoursMs: settings.businessHours?.ms || '',
      googleMapsUrl: settings.contact?.googleMapsUrl || '',
      geoLat: settings.contact?.geo?.lat !== undefined ? String(settings.contact.geo.lat) : '',
      geoLng: settings.contact?.geo?.lng !== undefined ? String(settings.contact.geo.lng) : '',
    });
    setSocialSettings({
      facebook: settings.social?.facebook || '',
      instagram: settings.social?.instagram || '',
      linkedin: settings.social?.linkedin || '',
      twitter: settings.social?.twitter || '',
    });
    setSeoSettings({
      defaultTitleEn: settings.seo?.defaultTitle?.en || '',
      defaultTitleMs: settings.seo?.defaultTitle?.ms || '',
      defaultDescEn: settings.seo?.defaultDescription?.en || '',
      defaultDescMs: settings.seo?.defaultDescription?.ms || '',
      googleVerification: settings.seo?.googleVerification || '',
      googleAnalyticsId: settings.analytics?.googleAnalyticsId || '',
      facebookPixelId: settings.analytics?.facebookPixelId || '',
    });
    setLocations(settings.locations || []);
  };

  const payload = useMemo(() => {
    const parseOptionalNumber = (value: string) => {
      const trimmed = value?.trim();
      return trimmed ? Number(trimmed) : undefined;
    };

    const geo =
      contactSettings.geoLat.trim() || contactSettings.geoLng.trim()
        ? {
            lat: parseOptionalNumber(contactSettings.geoLat),
            lng: parseOptionalNumber(contactSettings.geoLng),
          }
        : undefined;

    return {
      siteName: generalSettings.siteName,
      tagline: {
        en: generalSettings.taglineEn,
        ms: generalSettings.taglineMs,
      },
      legal: {
        companyName: generalSettings.companyName,
        registrationNumber: generalSettings.registrationNumber,
        licenseNumber: generalSettings.licenseNumber,
      },
      contact: {
        phone: contactSettings.phone,
        whatsapp: contactSettings.whatsapp,
        email: contactSettings.email,
        address: {
          en: contactSettings.addressEn,
          ms: contactSettings.addressMs,
        },
        googleMapsUrl: contactSettings.googleMapsUrl,
        geo,
      },
      businessHours: {
        en: contactSettings.businessHoursEn,
        ms: contactSettings.businessHoursMs,
      },
      social: {
        facebook: socialSettings.facebook,
        instagram: socialSettings.instagram,
        linkedin: socialSettings.linkedin,
        twitter: socialSettings.twitter,
      },
      seo: {
        defaultTitle: {
          en: seoSettings.defaultTitleEn,
          ms: seoSettings.defaultTitleMs,
        },
        defaultDescription: {
          en: seoSettings.defaultDescEn,
          ms: seoSettings.defaultDescMs,
        },
        googleVerification: seoSettings.googleVerification,
      },
      analytics: {
        googleAnalyticsId: seoSettings.googleAnalyticsId,
        facebookPixelId: seoSettings.facebookPixelId,
      },
      locations,
    };
  }, [generalSettings, contactSettings, socialSettings, seoSettings, locations]);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsFetching(true);
      setMessage(null);
      try {
        const response = await getSettings();
        if (!response.success) {
          throw new Error(response.message || 'Failed to load settings');
        }
        if (response.data) {
          applySettings(response.data as SiteSettings);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        setMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'Failed to load settings',
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchSettings();
  }, []);

  const sectionLabels: Record<SettingsSection, string> = {
    general: 'General',
    contact: 'Contact',
    social: 'Social Media',
    seo: 'SEO & Analytics',
    locations: 'Locations',
  };

  const heroCard = (
    <Card className="relative overflow-hidden border-white/70 bg-white/90">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-transparent" />
      <CardContent className="relative flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
            Control center
          </p>
          <h1 className="mt-3 text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Update branding, contact channels, and location details.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Changes sync to the marketing site instantly.
        </div>
      </CardContent>
    </Card>
  );

  const handleSave = async (section: SettingsSection) => {
    setSavingSection(section);
    setMessage(null);

    try {
      const response = await updateSettings(payload);
      if (!response.success) {
        throw new Error(response.message || 'Failed to save settings');
      }
      if (response.data) {
        applySettings(response.data as SiteSettings);
      }
      setMessage({
        type: 'success',
        text: `${sectionLabels[section]} settings saved successfully`,
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save settings',
      });
    } finally {
      setSavingSection(null);
    }
  };

  const updateLocation = (index: number, next: Partial<SiteLocation>) => {
    setLocations((prev) =>
      prev.map((location, i) => (i === index ? { ...location, ...next } : location))
    );
  };

  const handleLocalizedFieldChange = (
    index: number,
    field: 'name' | 'summary' | 'address' | 'hours',
    lang: keyof LocalizedValue,
    value: string
  ) => {
    setLocations((prev) =>
      prev.map((location, i) =>
        i === index
          ? {
              ...location,
              [field]: {
                ...(location[field] || {}),
                [lang]: value,
              },
            }
          : location
      )
    );
  };

  const handleLocalizedListChange = (
    index: number,
    field: 'services' | 'areasServed',
    itemIndex: number,
    lang: keyof LocalizedValue,
    value: string
  ) => {
    setLocations((prev) =>
      prev.map((location, i) => {
        if (i !== index) return location;
        const list = [...(location[field] || [])];
        list[itemIndex] = {
          ...(list[itemIndex] || {}),
          [lang]: value,
        };
        return { ...location, [field]: list };
      })
    );
  };

  const handleAddLocalizedListItem = (index: number, field: 'services' | 'areasServed') => {
    setLocations((prev) =>
      prev.map((location, i) =>
        i === index ? { ...location, [field]: [...(location[field] || []), {}] } : location
      )
    );
  };

  const handleRemoveLocalizedListItem = (
    index: number,
    field: 'services' | 'areasServed',
    itemIndex: number
  ) => {
    setLocations((prev) =>
      prev.map((location, i) => {
        if (i !== index) return location;
        const list = [...(location[field] || [])];
        list.splice(itemIndex, 1);
        return { ...location, [field]: list };
      })
    );
  };

  const handleFaqChange = (
    index: number,
    faqIndex: number,
    part: 'question' | 'answer',
    lang: keyof LocalizedValue,
    value: string
  ) => {
    setLocations((prev) =>
      prev.map((location, i) => {
        if (i !== index) return location;
        const faqs = [...(location.faqs || [])];
        faqs[faqIndex] = {
          ...(faqs[faqIndex] || {}),
          [part]: {
            ...((faqs[faqIndex]?.[part] as LocalizedValue) || {}),
            [lang]: value,
          },
        };
        return { ...location, faqs };
      })
    );
  };

  const handleAddFaq = (index: number) => {
    setLocations((prev) =>
      prev.map((location, i) =>
        i === index
          ? { ...location, faqs: [...(location.faqs || []), { question: {}, answer: {} }] }
          : location
      )
    );
  };

  const handleRemoveFaq = (index: number, faqIndex: number) => {
    setLocations((prev) =>
      prev.map((location, i) => {
        if (i !== index) return location;
        const faqs = [...(location.faqs || [])];
        faqs.splice(faqIndex, 1);
        return { ...location, faqs };
      })
    );
  };

  const handleLocationGeoChange = (index: number, key: 'lat' | 'lng', value: string) => {
    const trimmed = value.trim();
    const numericValue = trimmed ? Number(trimmed) : undefined;
    setLocations((prev) =>
      prev.map((location, i) =>
        i === index
          ? {
              ...location,
              geo: {
                ...(location.geo || {}),
                [key]: numericValue,
              },
            }
          : location
      )
    );
  };

  const handleLocationRatingChange = (index: number, key: 'score' | 'count', value: string) => {
    const trimmed = value.trim();
    const numericValue =
      trimmed === ''
        ? undefined
        : key === 'count'
        ? parseInt(trimmed, 10)
        : parseFloat(trimmed);
    setLocations((prev) =>
      prev.map((location, i) =>
        i === index
          ? {
              ...location,
              ratingSummary: {
                ...(location.ratingSummary || {}),
                [key]: numericValue,
              },
            }
          : location
      )
    );
  };

  const handleAddLocation = () => {
    setLocations((prev) => [
      ...prev,
      {
        slug: '',
        name: {},
        summary: {},
        address: {},
      },
    ]);
  };

  const handleRemoveLocation = (index: number) => {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  };

  if (isFetching) {
    return (
      <div className="space-y-6">
        {heroCard}
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {heroCard}

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="seo">SEO & Analytics</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic website information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input
                    value={generalSettings.siteName}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, siteName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Name (Legal)</Label>
                  <Input
                    value={generalSettings.companyName}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, companyName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tagline (English)</Label>
                  <Input
                    value={generalSettings.taglineEn}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, taglineEn: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tagline (Malay)</Label>
                  <Input
                    value={generalSettings.taglineMs}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, taglineMs: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SSM Registration Number</Label>
                  <Input
                    value={generalSettings.registrationNumber}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, registrationNumber: e.target.value })
                    }
                    placeholder="e.g., 123456-X"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Money Lender License Number</Label>
                  <Input
                    value={generalSettings.licenseNumber}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, licenseNumber: e.target.value })
                    }
                    placeholder="e.g., WP/12345/2024"
                  />
                </div>
              </div>
              <Button
                onClick={() => handleSave('general')}
                disabled={savingSection === 'general' || isFetching}
              >
                {savingSection === 'general' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Settings */}
        <TabsContent value="contact">
          <Card className="border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How customers can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={contactSettings.phone}
                    onChange={(e) => setContactSettings({ ...contactSettings, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input
                    value={contactSettings.whatsapp}
                    onChange={(e) => setContactSettings({ ...contactSettings, whatsapp: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={contactSettings.email}
                    onChange={(e) => setContactSettings({ ...contactSettings, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Address (English)</Label>
                  <Textarea
                    value={contactSettings.addressEn}
                    onChange={(e) => setContactSettings({ ...contactSettings, addressEn: e.target.value })}
                    placeholder="Enter full address"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address (Malay)</Label>
                  <Textarea
                    value={contactSettings.addressMs}
                    onChange={(e) => setContactSettings({ ...contactSettings, addressMs: e.target.value })}
                    placeholder="Masukkan alamat penuh"
                    rows={3}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Hours (English)</Label>
                  <Input
                    value={contactSettings.businessHoursEn}
                    onChange={(e) => setContactSettings({ ...contactSettings, businessHoursEn: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business Hours (Malay)</Label>
                  <Input
                    value={contactSettings.businessHoursMs}
                    onChange={(e) => setContactSettings({ ...contactSettings, businessHoursMs: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Google Maps URL</Label>
                  <Input
                    value={contactSettings.googleMapsUrl}
                    onChange={(e) => setContactSettings({ ...contactSettings, googleMapsUrl: e.target.value })}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={contactSettings.geoLat}
                    onChange={(e) => setContactSettings({ ...contactSettings, geoLat: e.target.value })}
                    placeholder="3.141592"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={contactSettings.geoLng}
                    onChange={(e) => setContactSettings({ ...contactSettings, geoLng: e.target.value })}
                    placeholder="101.686853"
                  />
                </div>
              </div>
              <Button
                onClick={() => handleSave('contact')}
                disabled={savingSection === 'contact' || isFetching}
              >
                {savingSection === 'contact' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Settings */}
        <TabsContent value="social">
          <Card className="border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Connect your social media accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input
                    value={socialSettings.facebook}
                    onChange={(e) => setSocialSettings({ ...socialSettings, facebook: e.target.value })}
                    placeholder="https://facebook.com/seamoneecredit"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input
                    value={socialSettings.instagram}
                    onChange={(e) => setSocialSettings({ ...socialSettings, instagram: e.target.value })}
                    placeholder="https://instagram.com/seamoneecredit"
                  />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={socialSettings.linkedin}
                    onChange={(e) => setSocialSettings({ ...socialSettings, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/company/seamoneecredit"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter URL</Label>
                  <Input
                    value={socialSettings.twitter}
                    onChange={(e) => setSocialSettings({ ...socialSettings, twitter: e.target.value })}
                    placeholder="https://twitter.com/seamoneecredit"
                  />
                </div>
              </div>
              <Button
                onClick={() => handleSave('social')}
                disabled={savingSection === 'social' || isFetching}
              >
                {savingSection === 'social' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo">
          <Card className="border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>SEO & Analytics</CardTitle>
              <CardDescription>Search engine and tracking settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Title (English)</Label>
                  <Input
                    value={seoSettings.defaultTitleEn}
                    onChange={(e) => setSeoSettings({ ...seoSettings, defaultTitleEn: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Title (Malay)</Label>
                  <Input
                    value={seoSettings.defaultTitleMs}
                    onChange={(e) => setSeoSettings({ ...seoSettings, defaultTitleMs: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Description (English)</Label>
                  <Textarea
                    value={seoSettings.defaultDescEn}
                    onChange={(e) => setSeoSettings({ ...seoSettings, defaultDescEn: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Description (Malay)</Label>
                  <Textarea
                    value={seoSettings.defaultDescMs}
                    onChange={(e) => setSeoSettings({ ...seoSettings, defaultDescMs: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Google Site Verification</Label>
                  <Input
                    value={seoSettings.googleVerification}
                    onChange={(e) => setSeoSettings({ ...seoSettings, googleVerification: e.target.value })}
                    placeholder="Verification code"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Google Analytics ID</Label>
                  <Input
                    value={seoSettings.googleAnalyticsId}
                    onChange={(e) => setSeoSettings({ ...seoSettings, googleAnalyticsId: e.target.value })}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Facebook Pixel ID</Label>
                  <Input
                    value={seoSettings.facebookPixelId}
                    onChange={(e) => setSeoSettings({ ...seoSettings, facebookPixelId: e.target.value })}
                    placeholder="XXXXXXXXXXXXXXX"
                  />
                </div>
              </div>
              <Button
                onClick={() => handleSave('seo')}
                disabled={savingSection === 'seo' || isFetching}
              >
                {savingSection === 'seo' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Locations */}
        <TabsContent value="locations">
          <Card className="border-white/70 bg-white/90">
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Locations</CardTitle>
                <CardDescription>Manage multi-city offices for geo-targeted SEO</CardDescription>
              </div>
              <Button variant="outline" onClick={handleAddLocation}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Location
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {locations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No locations configured yet. Add each branch, service area, or city-specific landing page to expose detailed local information.
                </p>
              ) : (
                locations.map((location, index) => (
                  <div key={`${location.slug || 'location'}-${index}`} className="space-y-4 rounded-md border p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {location.name?.en || location.slug || `Location ${index + 1}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Localized content, NAP details, and structured data signals
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleRemoveLocation(index)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input
                          value={location.slug}
                          onChange={(e) => updateLocation(index, { slug: e.target.value })}
                          placeholder="e.g., kuala-lumpur"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Name (English)</Label>
                        <Input
                          value={location.name?.en || ''}
                          onChange={(e) => handleLocalizedFieldChange(index, 'name', 'en', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Name (Malay)</Label>
                        <Input
                          value={location.name?.ms || ''}
                          onChange={(e) => handleLocalizedFieldChange(index, 'name', 'ms', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Summary (English)</Label>
                        <Textarea
                          rows={3}
                          value={location.summary?.en || ''}
                          onChange={(e) => handleLocalizedFieldChange(index, 'summary', 'en', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Summary (Malay)</Label>
                        <Textarea
                          rows={3}
                          value={location.summary?.ms || ''}
                          onChange={(e) => handleLocalizedFieldChange(index, 'summary', 'ms', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Address (English)</Label>
                        <Textarea
                          rows={3}
                          value={location.address?.en || ''}
                          onChange={(e) => handleLocalizedFieldChange(index, 'address', 'en', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Address (Malay)</Label>
                        <Textarea
                          rows={3}
                          value={location.address?.ms || ''}
                          onChange={(e) => handleLocalizedFieldChange(index, 'address', 'ms', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={location.phone || ''}
                          onChange={(e) => updateLocation(index, { phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>WhatsApp</Label>
                        <Input
                          value={location.whatsapp || ''}
                          onChange={(e) => updateLocation(index, { whatsapp: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={location.email || ''}
                          onChange={(e) => updateLocation(index, { email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Business Hours (English)</Label>
                        <Input
                          value={location.hours?.en || ''}
                          onChange={(e) => handleLocalizedFieldChange(index, 'hours', 'en', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Business Hours (Malay)</Label>
                        <Input
                          value={location.hours?.ms || ''}
                          onChange={(e) => handleLocalizedFieldChange(index, 'hours', 'ms', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Map Embed URL</Label>
                        <Input
                          value={location.mapEmbedUrl || ''}
                          onChange={(e) => updateLocation(index, { mapEmbedUrl: e.target.value })}
                          placeholder="https://www.google.com/maps/embed?..."
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Latitude</Label>
                          <Input
                            type="number"
                            step="0.000001"
                            value={location.geo?.lat ?? ''}
                            onChange={(e) => handleLocationGeoChange(index, 'lat', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Longitude</Label>
                          <Input
                            type="number"
                            step="0.000001"
                            value={location.geo?.lng ?? ''}
                            onChange={(e) => handleLocationGeoChange(index, 'lng', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Average Rating</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={location.ratingSummary?.score ?? ''}
                          onChange={(e) => handleLocationRatingChange(index, 'score', e.target.value)}
                          placeholder="4.9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Review Count</Label>
                        <Input
                          type="number"
                          step="1"
                          min={0}
                          value={location.ratingSummary?.count ?? ''}
                          onChange={(e) => handleLocationRatingChange(index, 'count', e.target.value)}
                          placeholder="120"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <Label className="text-base">Services</Label>
                          <p className="text-sm text-muted-foreground">Local offerings shown on location pages</p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAddLocalizedListItem(index, 'services')}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Service
                        </Button>
                      </div>
                      {(location.services?.length || 0) === 0 ? (
                        <p className="text-sm text-muted-foreground">No services added yet.</p>
                      ) : (
                        location.services?.map((service, serviceIndex) => (
                          <div key={`service-${serviceIndex}`} className="space-y-3 rounded-md border p-3">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">Service {serviceIndex + 1}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleRemoveLocalizedListItem(index, 'services', serviceIndex)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </Button>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>English Label</Label>
                                <Input
                                  value={service?.en || ''}
                                  onChange={(e) =>
                                    handleLocalizedListChange(index, 'services', serviceIndex, 'en', e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Malay Label</Label>
                                <Input
                                  value={service?.ms || ''}
                                  onChange={(e) =>
                                    handleLocalizedListChange(index, 'services', serviceIndex, 'ms', e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <Label className="text-base">Areas Served</Label>
                          <p className="text-sm text-muted-foreground">Mention nearby suburbs or towns</p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAddLocalizedListItem(index, 'areasServed')}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Area
                        </Button>
                      </div>
                      {(location.areasServed?.length || 0) === 0 ? (
                        <p className="text-sm text-muted-foreground">No areas added yet.</p>
                      ) : (
                        location.areasServed?.map((area, areaIndex) => (
                          <div key={`area-${areaIndex}`} className="space-y-3 rounded-md border p-3">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">Area {areaIndex + 1}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleRemoveLocalizedListItem(index, 'areasServed', areaIndex)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </Button>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>English Label</Label>
                                <Input
                                  value={area?.en || ''}
                                  onChange={(e) =>
                                    handleLocalizedListChange(index, 'areasServed', areaIndex, 'en', e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Malay Label</Label>
                                <Input
                                  value={area?.ms || ''}
                                  onChange={(e) =>
                                    handleLocalizedListChange(index, 'areasServed', areaIndex, 'ms', e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <Label className="text-base">Local FAQs</Label>
                          <p className="text-sm text-muted-foreground">Answer city-specific customer questions</p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => handleAddFaq(index)}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add FAQ
                        </Button>
                      </div>
                      {(location.faqs?.length || 0) === 0 ? (
                        <p className="text-sm text-muted-foreground">No FAQs added yet.</p>
                      ) : (
                        location.faqs?.map((faq, faqIndex) => (
                          <div key={`faq-${faqIndex}`} className="space-y-3 rounded-md border p-3">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">FAQ {faqIndex + 1}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleRemoveFaq(index, faqIndex)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </Button>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Question (English)</Label>
                                <Textarea
                                  rows={2}
                                  value={faq?.question?.en || ''}
                                  onChange={(e) =>
                                    handleFaqChange(index, faqIndex, 'question', 'en', e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Question (Malay)</Label>
                                <Textarea
                                  rows={2}
                                  value={faq?.question?.ms || ''}
                                  onChange={(e) =>
                                    handleFaqChange(index, faqIndex, 'question', 'ms', e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Answer (English)</Label>
                                <Textarea
                                  rows={3}
                                  value={faq?.answer?.en || ''}
                                  onChange={(e) =>
                                    handleFaqChange(index, faqIndex, 'answer', 'en', e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Answer (Malay)</Label>
                                <Textarea
                                  rows={3}
                                  value={faq?.answer?.ms || ''}
                                  onChange={(e) =>
                                    handleFaqChange(index, faqIndex, 'answer', 'ms', e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave('locations')}
                  disabled={savingSection === 'locations' || isFetching}
                >
                  {savingSection === 'locations' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Locations
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
