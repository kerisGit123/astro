import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/landing/site-footer"

export default function DisclaimerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container px-4 md:px-6 py-20 mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Disclaimer</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 mb-8">
            <p className="text-amber-200 font-semibold">
              IMPORTANT: Please read this disclaimer carefully before using ZiWei Path.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Nature of Service</h2>
            <p className="text-muted-foreground">
              ZiWei Path provides interpretative analysis based on traditional metaphysical systems including 
              紫微斗數 (Zi Wei Dou Shu), Western Astrology, and Chinese Zodiac. The Service is designed for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li><strong>Self-awareness and personal development</strong></li>
              <li><strong>Educational purposes</strong></li>
              <li><strong>Entertainment and cultural exploration</strong></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Not Professional Advice</h2>
            <p className="text-muted-foreground mb-4">
              ZiWei Path does NOT provide and should NOT be considered as:
            </p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Medical Advice</h3>
                <p className="text-muted-foreground">
                  Our insights are not a substitute for professional medical advice, diagnosis, or treatment. 
                  Always consult qualified healthcare providers for medical concerns.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Legal Advice</h3>
                <p className="text-muted-foreground">
                  Nothing on this platform constitutes legal advice. Consult a licensed attorney for legal matters.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Financial Advice</h3>
                <p className="text-muted-foreground">
                  Our wealth and career insights are not financial advice. Consult certified financial advisors 
                  for investment, tax, or financial planning decisions.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Mental Health Counseling</h3>
                <p className="text-muted-foreground">
                  We do not provide therapy or mental health services. If you are experiencing mental health 
                  issues, please seek help from licensed mental health professionals.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Relationship Counseling</h3>
                <p className="text-muted-foreground">
                  Compatibility analysis is for informational purposes only. For serious relationship issues, 
                  consult licensed marriage and family therapists.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. No Guarantees or Predictions</h2>
            <p className="text-muted-foreground">
              ZiWei Path does not and cannot:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Predict specific future events with certainty</li>
              <li>Guarantee any particular outcome in life, career, or relationships</li>
              <li>Determine your fate or remove your free will</li>
              <li>Replace critical thinking and personal judgment</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              All interpretations are based on traditional systems and should be viewed as one perspective 
              among many for understanding life patterns.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Personal Responsibility</h2>
            <p className="text-muted-foreground">
              You are solely responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>All decisions you make based on information from ZiWei Path</li>
              <li>Evaluating the relevance and applicability of insights to your situation</li>
              <li>Seeking professional advice when needed</li>
              <li>Using the Service in a balanced and healthy manner</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Accuracy and Completeness</h2>
            <p className="text-muted-foreground">
              While we strive for accuracy in our calculations and interpretations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Chart accuracy depends on the accuracy of birth data you provide</li>
              <li>Interpretations are based on traditional systems and may not reflect modern research</li>
              <li>Different practitioners may interpret the same chart differently</li>
              <li>We do not guarantee error-free service at all times</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cultural and Religious Considerations</h2>
            <p className="text-muted-foreground">
              ZiWei Path draws from traditional Chinese and Western metaphysical systems. These may:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Conflict with certain religious or cultural beliefs</li>
              <li>Not align with scientific or empirical worldviews</li>
              <li>Be interpreted differently across cultures and traditions</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Use of this Service is voluntary and should align with your personal beliefs and values.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the fullest extent permitted by law, ZiWei Path and its operators are not liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Any decisions or actions taken based on information from the Service</li>
              <li>Any direct, indirect, incidental, or consequential damages</li>
              <li>Loss of profits, data, or opportunities</li>
              <li>Emotional distress or psychological harm</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Third-Party Content</h2>
            <p className="text-muted-foreground">
              If we reference or link to third-party content, we do not endorse or take responsibility for 
              the accuracy, legality, or content of external sites or resources.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Changes to Service</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time 
              without liability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Acknowledgment</h2>
            <p className="text-muted-foreground">
              By using ZiWei Path, you acknowledge that you have read, understood, and agree to this Disclaimer. 
              You understand that the Service is for informational and educational purposes only and should not 
              replace professional advice in any area of life.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
            <p className="text-muted-foreground">
              If you have questions about this Disclaimer, contact us at legal@ziwei-path.com
            </p>
          </section>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mt-8">
            <p className="text-primary font-semibold mb-2">
              Remember: You are the author of your own life.
            </p>
            <p className="text-muted-foreground">
              ZiWei Path is a tool for self-reflection and awareness, not a replacement for your judgment, 
              professional guidance, or personal agency.
            </p>
          </div>

          <p className="text-sm text-muted-foreground mt-8 pt-8 border-t border-border">
            Last updated: December 30, 2024
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
