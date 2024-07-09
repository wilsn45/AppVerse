//
//  TimeTracker.swift
//  RiddleMania
//
//  Created by Wilson.Shakya on 08/07/24.
//

import Foundation

import SwiftUI

struct TimeTracker: View {

	let totalTime: TimeInterval
	@State private var elapsedTime: TimeInterval = 0
	private var remainingTime: TimeInterval {
		max(totalTime - elapsedTime, 0)
	}
	private var progress: Double {
		elapsedTime / totalTime
	}
	var colors: [Color] = [.green, .yellow, .orange, .red]
	private var currentColor: Color {
		let index = min(Int(progress * Double(colors.count)), colors.count - 1)
		return colors[index]
	}

	private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

	let elapsed: (() -> Void)

	var body: some View {
		VStack {
			GeometryReader { geometry in
				ZStack(alignment: .leading) {
					Rectangle()
						.foregroundColor(Color.white)
						.frame(width: geometry.size.width, height: 20)

					Rectangle()
						.foregroundColor(currentColor)
						.frame(width: geometry.size.width * CGFloat(progress), height: 20)
				}
			}
			.frame(maxHeight: 25)
			Text("Time Left: \(Int(remainingTime)) seconds")
				.frame(maxHeight: 20)
		}
		.onReceive(timer) { _ in
			elapsedTime += 1
			if elapsedTime >= totalTime {
				elapsed()
				timer.upstream.connect().cancel()
			}
		}
	}

}
