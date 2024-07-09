//
//  Analytics.swift
//  TheQuizApp
//
//  Created by Wilson.Shakya on 09/07/24.
//

import Foundation
import FirebaseAnalytics


class Analytics {
	static func log(event: Event, data: [String: Any]?) {
		let name = event.name
		var parameter = data ?? [String: Any]()
		parameter["category"] = event.category
		parameter["type"] = event.type
		parameter["timestamp"] = event.timestamp
		FirebaseAnalytics.Analytics.logEvent(name, parameters: parameter)
	}
}

struct Event {
	let name: String
	let category: EventCategory
	let type: EventType
	var timestamp: String {
		let dateFormatter = DateFormatter()
		dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
		let currentDateString = dateFormatter.string(from: Date())
		return currentDateString
	}
}

enum EventCategory {
	case home
	case quiz
	case leaderboard
}

enum EventType: String {
	case click
	case impression
}
