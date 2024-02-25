use serde_derive::{Deserialize, Serialize};
use std::borrow::Cow;
use pkcore::arrays::matchups::sorted_heads_up::SortedHeadsUp;
use pkcore::arrays::two::Two;
use pkcore::bard::Bard;
use warp::http::Response;
use warp::Filter;

#[derive(Debug, Deserialize, Serialize)]
struct Hup {
    hero: u64,
    villain: u64,
}

#[derive(Debug, Deserialize, Serialize)]
struct ProcessedHup {
    hup: Hup,
    twos: SortedHeadsUp,
}

impl TryFrom<Hup> for ProcessedHup {
    type Error = &'static str;

    fn try_from(hup: Hup) -> Result<Self, Self::Error> {
        let hero = match Two::try_from(Bard::from(hup.hero)) {
            Ok(two) => two,
            Err(_) => return Err("Hero is not a valid Bard"),
        };
        let villain = match Two::try_from(Bard::from(hup.villain)) {
            Ok(two) => two,
            Err(_) => return Err("Villain is not a valid Bard"),
        };

        if hup.hero == hup.villain {
            return Err("hero and villain cannot be the same");
        }
        Ok(ProcessedHup {
            hup,
            twos: SortedHeadsUp::new(hero, villain),
        })
    }
}

#[derive(Deserialize, Serialize)]
struct MyObject {
    key1: String,
    key2: u32,
}

/// See <https://github.com/seanmonstar/warp/blob/master/examples/query_string.rs />
#[tokio::main]
async fn main() {
    pretty_env_logger::init();

    let hello =
        warp::path!("hello" / String).map(|name| format!("Hello, \n{}!", decode_string(name)));

    let hup_path = warp::get()
        .and(warp::path("hup"))
        .and(warp::query::<Hup>())
        .map(|p: Hup| {
            let processed = match ProcessedHup::try_from(p) {
                Ok(processed) => processed,
                Err(e) => return Response::builder().body(format!("{}", e)),
            };
            Response::builder().body(format!("{}", processed.twos.get_letter_index()))
        });

    let example2 = warp::get()
        .and(warp::path("example2"))
        .and(warp::query::<MyObject>())
        .map(|p: MyObject| {
            Response::builder().body(format!("key1 = {}, key2 = {}", p.key1, p.key2))
        });

    warp::serve(hello.or(example2).or(hup_path))
        .run(([127, 0, 0, 1], 3030))
        .await;
}

fn decode(s: &str) -> String {
    replace_plus(
        percent_encoding::percent_decode_str(s)
            .decode_utf8()
            .unwrap(),
    )
}

fn decode_string(s: String) -> String {
    decode(s.as_str())
}

/// I will confess that the magic that `replace()` can take a char
/// and a Cow<str> and return a String is beyond me (hopefully, at
/// the moment).
fn replace_plus(s: Cow<str>) -> String {
    s.replace('+', " ")
}

#[cfg(test)]
#[allow(non_snake_case)]
mod main_tests {
    #[test]
    fn decode() {
        let s = "A%E2%99%A0+J%E2%99%A6+6%E2%99%A5+6%E2%99%A3";

        assert_eq!(super::decode(s), "A♠ J♦ 6♥ 6♣");
    }

    #[test]
    fn decode_string() {
        let s = "A%E2%99%A0+J%E2%99%A6+6%E2%99%A5+6%E2%99%A3";

        assert_eq!(super::decode_string(s.into()), "A♠ J♦ 6♥ 6♣");
    }

    #[test]
    fn replace_plus() {
        assert_eq!(super::replace_plus("A♠+J♦+6♥+6♣".into()), "A♠ J♦ 6♥ 6♣");
    }
}
