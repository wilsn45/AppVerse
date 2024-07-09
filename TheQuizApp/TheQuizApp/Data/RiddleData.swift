//
//  RiddleData.swift
//  RiddleMania
//
//  Created by Wilson.Shakya on 07/07/24.
//

import Foundation

import SwiftUI
import Combine

struct RiddleOption {
	let id: String
	let option: String
}

struct RiddleOptionData {
	let options: [RiddleOption]
	let correctOption: String
}

class RiddleData: ObservableObject {
	@Published var riddleType: RiddleType = .math
	@Published var timerType: TimerOptionType = .oneMin
}

enum RiddleType {
	case math
	case english
	case logical
	case crypto

	var title: String {
		switch self {
			case .math:
				return "MATH"
			case .english:
				return "ENGLISH"
			case .logical:
				return "LOGICAL"
			case .crypto:
				return "CRYPTO"
		}
	}
}


enum TimerOptionType {
	case oneMin
	case threeMin
	case fiveMin

	var value: TimeInterval {
		switch self {
			case .oneMin: return 60
			case .threeMin: return 180
			case .fiveMin: return  300
		}
	}

	var title: String{
		switch self {
			case .oneMin: return "1 Minute"
			case .threeMin: return "3 Minute"
			case .fiveMin: return  "5 Minute"
		}
	}
}
