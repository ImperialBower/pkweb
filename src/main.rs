use std::borrow::Cow;
use warp::Filter;

///
#[tokio::main]
async fn main() {
    let hello =
        warp::path!("hello" / String).map(|name| format!("Hello, \n{}!", decode_string(name)));

    warp::serve(hello).run(([127, 0, 0, 1], 3030)).await;
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
