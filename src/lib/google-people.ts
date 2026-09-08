/**
 * Isolated I/O helper for the Google People API phone-number lookup.
 * Kept separate from the pure oauth-sync module so it can be tested with
 * mocked `fetch` rather than property tests.
 */

interface GooglePeoplePhoneNumber {
    value?: string;
}

interface GooglePeopleResponse {
    phoneNumbers?: GooglePeoplePhoneNumber[];
}

/**
 * Best-effort lookup — People API access requires the
 * user.phonenumbers.read scope and often requires app verification
 * in Google Cloud Console, so failures are expected and non-fatal (Req 2.3).
 */
export async function fetchGooglePhoneNumbers(
    accessToken: string
): Promise<GooglePeoplePhoneNumber[] | null> {
    try {
        const res = await fetch(
            'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers',
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!res.ok) return null;
        const data = (await res.json()) as GooglePeopleResponse;
        return data.phoneNumbers ?? null;
    } catch (error) {
        console.warn('[oauth-sync] Google People API lookup failed:', error);
        return null;
    }
}
