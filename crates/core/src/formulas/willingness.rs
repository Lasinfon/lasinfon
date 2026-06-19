/// Compute willingness to pay W (Chapter 8).
pub fn compute_willingness_pay(
    enhancement: f64,
    source_credibility: f64,
    audience_trust_base: f64,
    uniqueness: f64,
    R: f64,
    w_enhance: f64,
    w_trust: f64,
    w_unique: f64,
    w_R: f64,
    w_source: f64,
    w_audience: f64,
) -> f64 {
    let trust = source_credibility * w_source + audience_trust_base * w_audience;
    w_enhance * enhancement + w_trust * trust + w_unique * uniqueness + w_R * R
}
