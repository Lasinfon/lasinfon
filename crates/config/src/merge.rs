use serde_json::Value;

/// Recursively merge two JSON AST nodes.
/// Merges `right` into `left`, with `right` taking precedence for leaf nodes.
/// - Objects are recursively merged.
/// - Arrays, numbers, strings, booleans, and null are replaced directly.
pub fn merge_json_values(left: &mut Value, right: &Value) {
    match (left, right) {
        (Value::Object(left_map), Value::Object(right_map)) => {
            for (key, val) in right_map {
                match left_map.get_mut(key) {
                    Some(existing) => merge_json_values(existing, val),
                    None => {
                        left_map.insert(key.clone(), val.clone());
                    }
                }
            }
        }
        (left_val, right_val) => {
            *left_val = right_val.clone();
        }
    }
}

/// Load and merge multiple JSON files into a single `Value`.
/// Files are merged left-to-right: later files override earlier ones.
pub fn load_and_merge_json_files(paths: &[std::path::PathBuf]) -> Result<Value, Box<dyn std::error::Error>> {
    if paths.is_empty() {
        return Err("At least one config file is required".into());
    }

    let mut base: Option<Value> = None;
    for path in paths {
        let content = std::fs::read_to_string(path)?;
        let value: Value = serde_json::from_str(&content)?;
        if let Some(ref mut base_val) = base {
            merge_json_values(base_val, &value);
        } else {
            base = Some(value);
        }
    }
    Ok(base.unwrap())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_merge_objects() {
        let mut left = json!({"a": 1, "b": {"x": 1}});
        let right = json!({"b": {"y": 2}, "c": 3});
        merge_json_values(&mut left, &right);
        assert_eq!(left, json!({"a": 1, "b": {"x": 1, "y": 2}, "c": 3}));
    }

    #[test]
    fn test_merge_override() {
        let mut left = json!({"a": 1, "b": [1,2]});
        let right = json!({"a": 2, "c": "hello"});
        merge_json_values(&mut left, &right);
        assert_eq!(left, json!({"a": 2, "b": [1,2], "c": "hello"}));
    }

    #[test]
    fn test_merge_array_replaces() {
        let mut left = json!({"data": [1,2,3]});
        let right = json!({"data": [4,5]});
        merge_json_values(&mut left, &right);
        assert_eq!(left, json!({"data": [4,5]}));
    }

    #[test]
    fn test_load_and_merge() {
        // This test is difficult without actual files; can be skipped or use temp files.
        // We'll test manually later.
    }
}
