use warp::Filter;

/// http://127.0.0.1:3030/hello/A%E2%99%A0+J%E2%99%A6+6%E2%99%A5+6%E2%99%A3
#[tokio::main]
async fn main() {
    let hello = warp::path!("hello" / String)
        .map(|name| format!("Hello, {}!", name));

    warp::serve(hello)
        .run(([127, 0, 0, 1], 3030))
        .await;
}
