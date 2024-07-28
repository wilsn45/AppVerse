//
//  NewItemView.swift
//  I
//
//  Created by Wilson.Shakya on 28/07/24.
//

import Foundation
import SwiftUI

struct NewItemView: View {
	let action: (() -> Void)

	var body: some View {
		VStack {
			Spacer()

			HStack {
				Spacer()

				Button(action: {
					action()
				}) {
					Image(systemName: "plus")
						.font(.system(size: 24))
						.foregroundColor(.white)
						.padding()
						.background(Color.blue)
						.clipShape(Circle())
				}

			}


		}
	}

}
